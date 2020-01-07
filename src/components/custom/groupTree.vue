<template>
  <li :class="isOpen||module.parentId===item.id?'active':''">
    <div
      :class="module&&(module.id==item.id||(!isUpdate&&module.parentId===item.id))?'choose':''"
      @dblclick="isPage?'':toggle(item)"
      @click="catalogChoose(item,isPage)"
      @contextmenu.prevent="ctxMenuOpen($event,item,isPage,itemIndex,items)"
    >
      <span>
        <i
          v-if="isFolder"
          :class="['fas' ,'fa-circle-notch' ,tipsColor]"
          @click="toggle(item)"
        ></i>
        <i
          v-else
          :class="['far' ,'fa-circle' ,tipsColor]"
          @click="toggle(item)"
        ></i>
        {{ item.displayName }}
      </span>
    </div>
    <ul v-if="isFolder">
      <group-tree
        v-for="(element,index) in item.children"
        :key="index"
        :items="item.children"
        :itemIndex="index"
        :item="element"
        :isPage="isPage"
        :module="module"
        @catalogChoose="catalogChoose"
        @ctxMenuOpen="ctxMenuOpen"
        @catalogAdd="catalogAdd"
      ></group-tree>
    </ul>
  </li>
</template>
<script>
export default {
    name: 'group-tree',
    data() {
        return {
            isOpen: false
        }
    },
    computed: {
        isFolder: function() {
            return this.item.children && this.item.children.length
        },
        tipsColor() {
            switch (this.item.catalogType) {
                case 1:
                    return `color-info`
                case 2:
                    return `color-success`
                case 3:
                    return `color-primary`
                default:
                    return `color-info`
            }
        }
    },
    props: {
        items: Array,
        itemIndex: Number,
        item: Object,
        module: Object,
        isPage: {
            type: Boolean,
            default: false
        },
        isUpdate: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        toggle: function() {
            this.isOpen = !this.isOpen
        },
        ctxMenuOpen(e, item, isPage, index, array) {
            this.$emit('ctxMenuOpen', e, item, isPage, index, array)
        },
        catalogChoose(val, isPage) {
            this.$emit('catalogChoose', val, isPage)
        },
        catalogAdd(parent, isPage) {
            this.$emit('catalogAdd', parent, isPage)
        }
    }
}
</script>
