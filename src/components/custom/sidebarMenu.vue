<template>
    <ul>
        <li
            :class="[item.items.length > 0 ? 'sidebar-dropdown' : '',
                     menuIndex.indexOf(item.customData)>-1  ? 'active' : '',
                     menuIndex==item.customData? 'current' : '',
                     ]"
            v-for="(item, index) in menu.items"
            :key="index"
        >
            <a @click="menuClick(item, item.customData)">
                <i
                    v-if="isRoot"
                    :class="[item.icon?item.icon:'fas fa-circle-notch','root']"
                ></i>
                <span>{{ item.displayName }}</span>
                <span v-if="item.target&&isRoot" class="badge badge-success">P</span>
            </a>
            <div class="sidebar-submenu">
                <sidebar-menu
                    :isRoot="false"
                    :menu="item"
                    :path="path"
                    :menuIndex="menuIndex"
                    @menuClick="menuClick"
                ></sidebar-menu>
            </div>
        </li>
    </ul>
</template>
<script>
export default {
    name: 'sidebar-menu',
    data() {
        return {
            imgtools: -1
        }
    },
    props: {
        menu: {
            required: true,
            type: Object
        },
        menuIndex: {
            required: true,
            type: String
        },
        path: {
            required: true,
            type: String
        },
        isRoot: Boolean
    },
    methods: {
        menuClick(item, customData) {
            this.$emit('menuClick', item, customData)
        }
    }
}
</script>
