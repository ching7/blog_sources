<template>
  <div :class="`image-thumbnail ${currentThumbIndex === index  ? 'is-thumbnail-active' : '' }` "
       id="imageThumbnail">
    <img class="image-thumbnail-img"
         v-if='imageSrc.trim().length>0'
         :src="imageSrc"
         ref='imageThumbnailImg'
         @click="viewImage">
    <div class="image-thumbnail-img image-thumbnail-img-empty "
         v-else
         ref='imageThumbnailImg'
         @click="insertImage">
      <span class="image-empty-tip">待采集</span>
    </div>
    <span class="image-thumbnail-index">第 {{ index + 1}} 页</span>
    <i class="el-icon-deletelightbox-icon"
            @on-click="delImage"></i>
    <i id="insertBut-l"
            class="el-icon-circle-plus-outline lightbox-set-icon-l"
            @on-click="addEmptyL()"></i>
    <i id="insertBut-r"
            class="el-icon-circle-plus-outline lightbox-set-icon-r"
            @on-click="addEmptyR()"></i>
  </div>
</template>
<script>
export default {
  props: {
    imageSrc: {
      // type:String,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    imageList: {
      required: true
    },
    currentThumbIndex: {
      required: true
    }
  },
  data () {
    return {
      archList: [],
      imageSetWin: false
    }
  },
  watch: {
  },
  mounted () {
  },
  name: 'imageThumbNail',
  methods: {
    delImage: function () {
      this.$emit('delImage', this.index)
    },
    viewImage: function () {
      this.$emit('viewImageList', this.index)
    },
    insertImage () {
      this.$emit('insertImage', this.index)
    },
    addEmptyR () {
      this.$emit('addEmptyList', this.index + 1)
    },
    addEmptyL () {
      this.$emit('addEmptyList', this.index === 0 ? 0 : this.index)
    },
    setImage () {
      this.archList = []
      this.archList = this.$store.getters.getScanArchList
    }
  }
}
</script>

<style scoped>
.image-thumbnail:hover {
  margin: 0px 20px;
}
.image-thumbnail:hover .lightbox-set-icon-r {
  display: inline-block;
}
.image-thumbnail:hover .lightbox-set-icon-l {
  display: inline-block;
}
.image-thumbnail:hover .image-thumbnail {
  position: relative;
  display: inline-block;
}
.image-thumbnail {
  position: relative;
  display: inline-block;
}
.is-thumbnail-active {
  border: 1px solid #1cb77b;
  border-radius: 6px;
}
.image-thumbnail-index {
  margin-top: 85px;
  margin-left: -90px;
  position: absolute;
  z-index: 1;
  cursor: pointer;
}
.image-empty-tip {
  display: table;
  font-size: 12px;
  color: #ffffff;
  margin: 30px 40px 30px 45px;
}
.image-thumbnail-img {
  border-radius: 6px;
  display: inherit;
  margin: 10px 5px;
  width: 130px;
  height: 74px;
  cursor: pointer;
  object-fit: contain;
  background: #404040;
}
.image-thumbnail-img-empty {
  border: 1px dotted #979797;
}
.image-thumbnail:hover .image-thumbnail-img-empty {
  border: 1px dotted #037df3;
}
.image-thumbnail:hover .image-thumbnail-img {
  border: 2px solid #037df3;
}
.image-thumbnail:hover .lightbox-icon {
  display: inline-block;
}
.lightbox-icon {
  color: #999;
  font-size: 20px;
  margin-left: -30px;
  margin-top: 10px;
  position: absolute;
  z-index: 1;
  cursor: pointer;
  display: inline-block;
}
.lightbox-set-icon {
  color: #999;
  font-size: 20px;
  margin-left: -30px;
  margin-top: 50px;
  position: absolute;
  z-index: 1;
  cursor: pointer;
  display: inline-block;
}
.lightbox-set-icon-l {
  color: #999;
  font-size: 20px;
  margin-top: 35px;
  margin-left: -160px;
  position: absolute;
  z-index: 1;
  cursor: pointer;
  display: none;
}
.lightbox-set-icon-r {
  color: #999;
  font-size: 20px;
  margin-top: 35px;
  margin-left: 0px;
  position: absolute;
  z-index: 1;
  cursor: pointer;
  display: none;
}
</style>
