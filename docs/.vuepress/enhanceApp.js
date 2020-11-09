// 三方组件引入
import Vue from 'vue'
// 首页contribution插件
import contribution from 'vue-contribution'
import 'vue-contribution/dist/vue-contribution.css'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import scanBoxDemo from './components/scanBox/scanBoxDemo'
// import VueCropper from 'vue-cropper' 


export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData // 站点元数据
}) => {
  // ...做一些其他的应用级别的优化
  Vue.use(contribution)
  Vue.use(Element)
  // Vue.use(VueCropper)
  // 自定义组件
  Vue.component('scanBoxDemo', scanBoxDemo)
  import('vue-cropper').then(function (m) {
		Vue.use(m.default)
  })
  // import('vue-json-views').then(function (m) {
	// 	Vue.use(m.default)
	// })
}