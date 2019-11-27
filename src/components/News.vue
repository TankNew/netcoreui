<template>
    <section class="container-fluid">
        <p class="lead">
            <i class="fas fa-bullhorn text-primary mr-1"></i>
            {{contentTitle}}
        </p>
        <tank-news
            :dataUrl="dataUrl"
            :sortUrl="sortUrl"
            :createUrl="createUrl"
            :updateUrl="updateUrl"
            :deleteUrl="deleteUrl"
            @refreshScroll="refreshScroll"
            @reloadScroll="reloadScroll"
            :scorllTopLength="scorllTopLength"
        ></tank-news>
    </section>
</template>
<script>
import tankNews from '@/components/custom/tankNews'

export default {
    name: 'news',
    data() {
        return {
            dataUrl: '/api/services/app/Announce/GetAll',
            sortUrl: '',
            createUrl: '',
            updateUrl: '',
            deleteUrl: ''
        }
    },
    components: {
        tankNews
    },
    props: ['scorllTopLength', 'contentTitle'],
    methods: {
        refreshScroll() {
            this.$emit('refreshScroll')
        },
        reloadScroll() {
            this.$emit('reloadScroll')
        }
    },
    created() {}
}
</script>
