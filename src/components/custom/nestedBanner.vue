<template>
  <draggable
    :class="[children.length>1?'border-left':'']"
    tag="ul"
    :disabled="dragging"
    :list="children"
    :animation="200"
    :group="{ name: 'ul'+ parentId}"
    :ghost-class="'ghost'"
  >
    <li v-for="(element,index) in children" :key="element.id">
      <div v-if="parentId!==0" class="o-line-up"></div>
      <a
        @mouseover="imgtools=index"
        @mouseout="imgtools=-1"
        :style="getImgUrl(element)"
      >
        <div class="img-cover-toolbar" v-show="imgtools==index">
          <p v-if="element.bannerImgs.length>0">
            <button
              type="button"
              title="编辑"
              v-b-tooltip.hover
              class="btn btn-info btn-xs"
              @click="edit(index,element)"
            >
              <i class="fas fa-pencil-alt" aria-hidden="true"></i>
            </button>
          </p>
          <p v-if="element.bannerImgs.length>0">
            <button
              type="button"
              title="删除"
              v-b-tooltip.hover
              class="btn btn-danger btn-xs"
              @click="del(index,element)"
            >
              <i class="fas fa-minus" aria-hidden="true"></i>
            </button>
          </p>
          <p v-if="!element.bannerImgs.length>0">
            <button
              type="button"
              title="自定义"
              v-b-tooltip.hover
              class="btn btn-success btn-xs"
              @click="add(index,element)"
            >
              <i class="fas fa-plus" aria-hidden="true"></i>
            </button>
          </p>
        </div>
        <span
          class="text_with_1px_border float-left ml-3 color-Purple font-weight-bold"
        >{{element.displayName}}</span>
      </a>
      <div class="o-line-down" v-if="element.children.length>0"></div>
      <nested-banner
        :dragging="dragging"
        :children="element.children"
        :parent="element"
        :parentId="element.id"
        @add="add"
        @del="del"
        @edit="edit"
      />
    </li>
  </draggable>
</template>
<script>
import draggable from 'vuedraggable'
import AppConsts from '../../utiltools/appconst'
export default {
    name: 'nested-banner',
    data() {
        return {
            imgtools: -1
        }
    },
    props: {
        dragging: {
            type: Boolean,
            required: true
        },
        children: {
            required: true,
            type: Array
        },
        parentId: {
            type: Number,
            default: 0
        },
        parent: {
            type: Object,
            default: null
        }
    },
    components: {
        draggable
    },
    methods: {
        getImgUrl(item) {
            let style = ''
            if (item.bannerImgs && item.bannerImgs.length > 0) {
                style = `background:url('${`https://cms.ednet.cn` +
                    item.bannerImgs[0].imgUrl}') fixed center / 100% auto;`
            } else if (this.parent !== null && this.parent !== undefined) {
                if (this.parent.bannerImgs && this.parent.bannerImgs.length > 0) {
                    item.grandParentImage = this.parent.bannerImgs[0].imgUrl
                } else if (this.parent.grandParentImage) item.grandParentImage = this.parent.grandParentImage
                if (item.grandParentImage)
                    style = `background:url('${`https://cms.ednet.cn` +
                        item.grandParentImage}') fixed center / 100% auto;`
            }

            return style
        },
        getCodeNumber(item) {
            if (item.code) {
                let arry = item.code.split('.')
                return arry.length
            }
        },
        add(index, item) {
            this.$emit('add', index, item)
        },
        edit(index, item) {
            this.$emit('edit', index, item)
        },
        del(index, item) {
            this.$emit('del', index, item)
        }
    }
}
</script>
<style lang='less' scoped>
.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
</style>
