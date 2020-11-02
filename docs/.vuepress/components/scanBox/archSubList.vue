<template>
  <div v-if="archInfoList">
    <arch-item v-for="arch in archInfoList"
               :key="arch.index"
               v-on="$listeners"
               :arch="arch"
               :isExpandArch="isExpandArch"
               :currentArchIndex="currentArchIndex" />
    <div class="arch-list-expand">
      <div class="expandIcon" @click.prevent.stop="expandArchList">
        <i class="el-icon-menu"></i>
      </div>
    </div>
  </div>
</template>
<script>
import archItem from './archItem'
export default {
  name: 'archSubList',
  components: { archItem },
  props: {
    archInfoList: {
      // type: String,
      default: ''
    },
    currentArchIndex: {
      default: 0
    },
    isExpandArch: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {}
  },
  methods: {
    expandArchList () {
      this.$emit('expandArchList')
    }

  }
}
</script>
<style lang="scss" scoped>
.arch-list-expand{
    position: absolute;
    bottom: 0;
    margin-top: 8px;
    width: 100%;
    height: 30px;
    background: #1f1f1f;
    transition: all .2s ease-in-out;
    .expandIcon{
      text-align: center;
      i {
        display: inline-block;
        font-size: 14px;
        color: #fff;
        cursor: pointer;
      }
    }
}
.open-scan-left{
  transition: all .2s ease-in-out;
  .arch-list-expand {
    .expandIcon {
      i {
        transition: all .2s ease-in-out;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
      }
      i:hover{
        transition: all .2s ease-in-out;
        transform: rotate(0deg);
        -webkit-transform: rotate(0deg);
      }
    }
  }
}
.close-scan-left{
  transition: all .2s ease-in-out;
  .arch-list-expand {
    .expandIcon {
      i {
        transition: all .2s ease-in-out;
        transform: rotate(-45deg);
        -webkit-transform: rotate(-45deg);
      }
      i:hover{
        transition: all .2s ease-in-out;
        transform: rotate(0deg);
        -webkit-transform: rotate(0deg);
      }
    }
  }
}
</style>
