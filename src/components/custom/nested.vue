<template>
  <draggable
    :class="[children.length>1?'border-left':'']"
    tag="ul"
    :disabled="dragging"
    :list="children"
    :animation="200"
    :group="{ name:'ul'+ parentId}"
    :ghost-class="'ghost'"
    :move="onMove"
    @change="handleChange"
  >
    <li v-for="(element,index) in children" :key="element.id">
      <div v-if="parentId!==0" class="o-line-up"></div>
      <a
        :style="hasbind&&!element.isActive?'background-color:#efefef':''"
        @contextmenu.prevent="!hasbind||(hasbind&&element.navbarType!==5)?ctxMenuOpen($event,element,index,currentLayer):''"
      >
        <span>{{`${element.displayName}`}}</span>
        <span v-if="hasbind">
          <small v-if="element.navbarType===0">菜单</small>
          <small v-else-if="element.navbarType===1">
            <i class="fas fa-cube"></i>
            {{element.webModule?element.webModule.displayName:'模块'}}
          </small>
          <small v-else-if="element.navbarType===2">
            <i class="fas fa-circle-notch"></i>
            {{element.catalogGroup?element.catalogGroup.displayName:'模块'}}
          </small>
          <small v-else-if="element.navbarType===3">
            <i class="fas fa-code"></i>
            {{element.page?element.page.displayName:'模块'}}
          </small>
          <small v-else-if="element.navbarType===4">链接</small>
          <small v-else>系统</small>
        </span>
      </a>
      <div class="o-line-down" v-if="element.children.length>0"></div>
      <nested-draggable
        v-if="element.children.length>0"
        :dragging="dragging"
        :dragUrl="dragUrl"
        :children="element.children"
        :parentId="element.id"
        :currentLayer="getCurrentLayer"
        :hasbind="hasbind"
        @onDrag="onDrag"
        @ctxMenuOpen="ctxMenuOpen"
      />
      <div class="clear"></div>
    </li>
  </draggable>
</template>
<script>
import draggable from 'vuedraggable'

export default {
    name: 'nested-draggable',
    data() {
        return {}
    },
    props: {
        children: {
            required: true,
            type: Array
        },
        dragging: {
            type: Boolean,
            required: true
        },
        dragUrl: {
            type: String,
            required: true
        },
        parentId: {
            type: Number,
            default: 0
        },
        currentLayer: {
            type: Number,
            default: 0
        },
        hasbind: {
            type: Boolean,
            default: false
        }
    },
    components: {
        draggable
    },
    computed: {
        getCurrentLayer() {
            return this.currentLayer + 1
        }
    },
    methods: {
        //初始目录 - 定义右键菜单
        ctxMenuOpen(e, item, index, currentLayer) {
            this.$emit('ctxMenuOpen', e, item, index, currentLayer)
        },
        onDrag(e) {
            this.$emit('onDrag', e)
        },
        onMove(e) {
            if (this.dragging) {
                console.log(`is dragging`)
                return false
            }
            console.log(e)
            let draged = e.draggedContext.element
            let to = e.relatedContext.element
            let json = {
                id: draged.id,
                toId: to.id,
                above: to.number < draged.number
            }
            let draggwaitting = new Promise((resolve, reject) => {
                this.dragUpdate = async () => {
                    await this.$http.post(this.dragUrl, json).then(res => {
                        this.children[e.draggedContext.futureIndex].number = res.data.result.number
                        this.onDrag(false)
                        resolve()
                    })
                }
            })
        },
        async handleChange(e) {
            this.onDrag(true)
            if (this.dragUpdate) {
                await this.dragUpdate()
                this.dragUpdate = null
            }
        }
    }
}
</script>
<style lang='less' scoped>
/*右键菜单定义*/
</style>
