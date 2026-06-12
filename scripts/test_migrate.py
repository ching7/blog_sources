import unittest
import migrate


class TestHelpers(unittest.TestCase):
    def test_normalize_date_pads_single_digits(self):
        self.assertEqual(migrate.normalize_date("2020-8-24"), "2020-08-24")

    def test_normalize_date_keeps_padded(self):
        self.assertEqual(migrate.normalize_date("2020-11-06"), "2020-11-06")

    def test_normalize_date_invalid_returns_none(self):
        self.assertIsNone(migrate.normalize_date("not-a-date"))

    def test_parse_frontmatter_splits_keys_and_body(self):
        text = "---\ntitle: Java 虚拟机\ncreateDate: 2020-8-24\ncategory: java\n---\n# 正文\nhello"
        fm, body = migrate.parse_frontmatter(text)
        self.assertEqual(fm["title"], "Java 虚拟机")
        self.assertEqual(fm["createDate"], "2020-8-24")
        self.assertEqual(fm["category"], "java")
        self.assertTrue(body.startswith("# 正文"))

    def test_parse_frontmatter_body_contains_hr(self):
        text = "---\ntitle: T\n---\nbody\n\n---\nmore"
        fm, body = migrate.parse_frontmatter(text)
        self.assertEqual(fm["title"], "T")
        self.assertIn("---", body)          # 正文中的水平线 HR 应保留
        self.assertTrue(body.startswith("body"))

    def test_build_frontmatter_maps_category_and_date(self):
        fm = {"title": "X", "createDate": "2020-8-24", "updateDate": "2020-9-1",
              "category": "java"}
        out = migrate.build_frontmatter(fm, "01.dev/12.java/x.md", "# X", is_vue=False)
        self.assertIn('title: "X"', out)
        self.assertIn("date: 2020-08-24", out)
        self.assertIn("lastmod: 2020-09-01", out)
        self.assertIn('categories: ["后端基础"]', out)
        self.assertIn('"java"', out)
        self.assertNotIn("归档", out)

    def test_build_frontmatter_vue_adds_archive_tag(self):
        out = migrate.build_frontmatter({"title": "demo"},
                                        "05.openSource/10.scanBox/scanBox.md",
                                        "# demo", is_vue=True)
        self.assertIn("归档", out)

    def test_strip_vue_removes_script_and_component(self):
        body = "# demo\n<scan-box-demo/>\n<script>\nexport default {}\n</script>\n正文"
        out = migrate.strip_vue(body)
        self.assertNotIn("<script>", out)
        self.assertNotIn("scan-box-demo", out)
        self.assertIn("正文", out)

    def test_rewrite_images_to_absolute(self):
        out = migrate.rewrite_images("![](./jvm.png)", "01.dev/12.java/jvm.md")
        self.assertEqual(out, "![](/images/01.dev/12.java/jvm.png)")


if __name__ == "__main__":
    unittest.main()
