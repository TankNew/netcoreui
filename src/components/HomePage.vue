<template>
    <section class="container-fluid">
        <p class="lead">
            <i class="far fa-images text-primary mr-1"></i>
            {{contentTitle}}
        </p>
        <b-alert show dismissible>
            <b>Info:</b> 公司简介和选择的栏目会根据前端进行自动匹配，如果可用将显示在前端。
        </b-alert>
        <section class="home-page-setting">
            <ul>
                <li>
                    <div class="custom-module-list">
                        <b-card-group deck>
                            <b-card
                                v-for="(block,index) in blocks"
                                :key="index"
                                :footer="block.title"
                                align="center"
                                img-height="150px"
                                img-src="https://picsum.photos/400/200/?image=41"
                                img-alt="Image"
                                img-top
                            >
                                <b-card-text>
                                    <b-form-textarea
                                        :rows="10"
                                        :max-rows="10"
                                        size="sm"
                                        placeholder="此处填写文字"
                                    ></b-form-textarea>
                                </b-card-text>
                            </b-card>
                        </b-card-group>
                    </div>
                </li>
                <li>
                    <dl>
                        <dt>文字类栏目</dt>
                        <dd>
                            <i class="fas fa-check"></i>集团新闻(已启用)
                        </dd>
                        <dd>
                            <i class="fas fa-check"></i>公司新闻(已启用)
                        </dd>
                        <dd class="notActive">3</dd>
                        <dd class="notActive">4</dd>
                    </dl>
                </li>
                <li>
                    <dl>
                        <dt>图片类栏目</dt>
                        <dd class="notActive">1</dd>
                        <dd class="notActive">2</dd>
                        <dd class="notActive">3</dd>
                        <dd class="notActive">4</dd>
                    </dl>
                </li>
                <li>
                    <dl>
                        <dt>产品类栏目</dt>
                        <dd class="notActive">1</dd>
                        <dd class="notActive">2</dd>
                        <dd class="notActive">3</dd>
                        <dd class="notActive">4</dd>
                    </dl>
                </li>
            </ul>
        </section>
    </section>
</template>
<script>
import swal from 'sweetalert'
import AppConsts from '../utiltools/appconst'
export default {
    data() {
        return {
            blocks: []
        }
    },
    props: ['contentTitle'],
    methods: {},
    created() {
        for (var i = 1; i < 5; i++) {
            this.blocks.push({ title: `主页图文${i}` })
        }
    },
    mounted() {
        // 开发调试
        this.$nextTick(() => {
            this.$emit('reloadScroll')
        })
    }
}
</script>
<style lang="less" scoped>
</style>
