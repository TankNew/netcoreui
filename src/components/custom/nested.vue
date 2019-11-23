<template>
    <draggable
        :class="[children.length>1?'border-left':'']"
        tag="ul"
        :disabled="dragging"
        :list="children"
        :animation="200"
        :group="{ name: 'ul'+ parentId}"
        :ghost-class="'ghost'"
        :move="onMove"
        @change="handleChange"
    >
        <li v-for="(element,index) in children" :key="element.id">
            <div v-if="parentId!==0" class="o-line-up"></div>
            <a
                @mouseover="imgtools=index"
                @mouseout="imgtools=-1"
                :style="hasbind&&!element.isActive?'background-color:#efefef':''"
            >
                <div
                    v-if="hasToolbar"
                    v-show="imgtools==index"
                    class="img-cover-toolbar"
                >
                    <button
                        v-if="parentId!==0"
                        type="button"
                        title="删除"
                        v-b-tooltip.hover
                        class="btn btn-danger btn-xs"
                        @click="del(index,element)"
                    >
                        <i class="fas fa-minus" aria-hidden="true"></i>
                    </button>
                    <button
                        v-if="parentId!==0"
                        type="button"
                        title="编辑"
                        v-b-tooltip.hover
                        class="btn btn-info btn-xs"
                        @click="edit(index,element)"
                    >
                        <i class="fas fa-pencil-alt" aria-hidden="true"></i>
                    </button>
                    <button
                        v-if="hasbind&&parentId!==0"
                        type="button"
                        title="切换"
                        v-b-tooltip.hover
                        class="btn btn-secondary btn-xs"
                        @click="unbind(index,element)"
                    >
                        <i class="fas fa-exchange-alt" aria-hidden="true"></i>
                    </button>
                    <button
                        v-if="hasbind&&!element.isMenu"
                        type="button"
                        title="绑定"
                        v-b-tooltip.hover
                        class="btn btn-primary btn-xs"
                        @click="bind(index,element)"
                    >
                        <i class="fas fa-link" aria-hidden="true"></i>
                    </button>

                    <button
                        v-if="!hasbind||(hasbind&&element.isMenu)"
                        type="button"
                        title="扩展"
                        class="btn btn-success btn-xs"
                        @click="add(index,element)"
                        v-b-tooltip.hover
                    >
                        <i class="fas fa-plus" aria-hidden="true"></i>
                    </button>
                </div>
                <span>{{element.displayName}}</span>
                <span v-if="hasbind">
                    <small v-if="!element.isMenu">
                        模块:{{element.webModule?element.webModule.name:'null'}}
                        <i
                            class="fas fa-cube"
                            v-if="element.webModule "
                        ></i>
                    </small>
                    <small v-else>菜单</small>
                </span>
            </a>
            <div
                class="o-line-down"
                v-if="element.isMenu&&element.children.length>0"
            ></div>
            <nested-draggable
                v-if="(hasbind&&element.isMenu)||!hasbind"
                :dragging="dragging"
                :dragUrl="dragUrl"
                :children="element.children"
                :parentId="element.id"
                :hasbind="hasbind"
                :hasToolbar="hasToolbar"
                @onDrag="onDrag"
                @add="add"
                @del="del"
                @edit="edit"
                @bind="bind"
                @unbind="unbind"
            />
        </li>
    </draggable>
</template>
<script>
import draggable from 'vuedraggable'

export default {
    name: 'nested-draggable',
    data() {
        return {
            imgtools: -1
        }
    },
    props: {
        children: {
            required: true,
            type: Array
        },
        parentId: Number,
        dragging: Boolean,
        dragUrl: String,
        hasbind: Boolean,
        hasToolbar: {
            type: Boolean,
            default: true
        }
    },
    components: {
        draggable
    },
    methods: {
        add(index, item) {
            this.$emit('add', index, item)
        },
        edit(index, item) {
            this.$emit('edit', index, item)
        },
        del(index, item) {
            this.$emit('del', index, item)
        },
        bind(index, item) {
            this.$emit('bind', index, item)
        },
        unbind(index, item) {
            this.$emit('unbind', index, item)
        },
        onDrag(e) {
            this.$emit('onDrag', e)
        },
        onMove(e) {
            if (this.dragging) {
                console.log(`is dragging`)
                return false
            }
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
.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
</style>
