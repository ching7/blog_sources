<template>
  <div :class="`arch-item ${currentArchIndex === arch.index  ? 'is-active' : ''}`"
       :title="arch.imageName"
       @click="itemClickHandler">
    <i :class="`${scanStatusClass}`"></i>
    <span v-if="arch.haveScan === '1'"
          style="color:rgba(241,76,93,1)">*</span>
    <span class="arch-name"
          v-if="isExpandArch">{{arch.imageName}}</span>
  </div>
</template>
<script>
export default {
  name: 'archItem',
  props: {
    arch: {
      // type: String,
      default: ''
    },
    currentArchIndex: {
      default: ''
    },
    isExpandArch: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      statusClassMap: {
        'done': 'el-icon-success',
        'active': 'el-icon-s-help',
        'todo': 'el-icon-circle-plus'
      }
    }
  },
  computed: {
    scanStatusClass () {
      let archStatus = this.currentArchIndex === this.arch.index
        ? 'active'
        : (this.arch.pageInfo && this.arch.pageInfo.length > 0) ? 'done' : 'todo'
      return this.statusClassMap[archStatus]
    }
  },
  methods: {
    itemClickHandler () {
      debugger
      if (this.currentArchIndex !== this.arch.index) {
        this.$emit('arch-change', this.arch.index)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.arch-item {
  width: 100%;
  height: 36px;
  background: #1f1f1f;
  border-bottom: 1px solid #2a2a2a;
  position: relative;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: #fff;
  font-size: 20px;
  &:hover {
    cursor: pointer;
    background: #2a2a2a;
  }
  .iconfont {
    margin: 0 3px;
  }
}
.is-active {
  background: #2a2a2a;
  i {
    color: #037df3;
  }
}
.arch-name {
  font-size: 14px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  color: rgba(255, 255, 255, 1);
}
.icon-success_fill {
  font-size: 18px;
  color: #1cb77b;
  display: inline-block;
  line-height: 36px;
}
.icon-addition_fill {
  font-size: 18px;
  display: inline-block;
  line-height: 36px;
}
.icon-bohuibiaoji {
  color: #f14c5d;
  position: absolute;
  font-size: 38px;
  right: 10px;
  top: -10px;
}
</style>
