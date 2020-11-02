<template>
  <div id="imageShowList" class="image-show-list">
    <vuedraggable v-model="imageListCopy" @end="onDragEnd">
    <image-thumb-nail v-for="(item, index) in imageListCopy"
                    v-on="$listeners"
                    :key="index"
                    :index="index"
                    :imageSrc="imageListCopy[index].filePath"
                    :currentThumbIndex="currentThumbIndex"
                    :imageList="imageList"
                    @viewImageList="viewImage"
                    @insertImage='insertImage'
                    @delImage="delImage"
                    @ocrAddImageList='ocrAddImage'
                    @addEmptyList='addEmpty' />
    </vuedraggable>

  </div>
</template>
<style>
</style>
<script>
import imageThumbNail from './imageThumbNail'
import vuedraggable from 'vuedraggable'
export default {
  props: {
    imageList: {
      // type: Array,
      required: true
    },
    importLocalFlag: {
      type: String,
      default: ''
    },
    currentThumbIndex: {
      required: true
    }
  },
  data () {
    return {
      imageListCopy: this.imageList
    }
  },
  name: 'imageThumbList',
  components: { imageThumbNail, vuedraggable },
  watch: {
    imageList (newVal, oldVal) {
      this.imageListCopy = newVal
    }
  },
  methods: {
    delImage: function (index) {
      if (index !== undefined) {
        this.$emit('delImages', index)
      }
    },
    insertImage (index) {
      if (index !== undefined) {
        this.$emit('insertImage', index)
      }
    },
    viewImage: function (index) {
      if (index !== undefined) {
        this.$emit('viewImage', index)
      }
    },
    addEmpty: function (index) {
      if (index !== undefined) {
        this.$emit('addEmpty', index)
      }
    },
    // addEmptyR: function (index) {
    //   if (index !== undefined) {
    //     this.$emit('addEmptyR', index)
    //   }
    // },
    ocrAddImage (ocrAddImage, index) {
      if (ocrAddImage !== undefined) {
        this.$emit('ocrAddImage', ocrAddImage, index)
      }
    },
    onDragEnd () {
      this.$emit('onDragEnd', this.imageListCopy)
    }
  }
}
</script>

<style scoped>
.image-show-list {
  height: 110px;
}
</style>
