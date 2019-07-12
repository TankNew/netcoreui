<template>
  <section class="container-fluid">
    <p class="lead">
      <i class="far fa-images text-primary mr-1"></i>
      Banner
    </p>
    <div class="my-3">
      <label class="banner-choose-tips">选择栏目：</label>
      <ul class="banner-choose">
        <li v-for="(item,index) in pages" :key="index" :class="item.name==currentPage.name?'active':''" @click="bindCurrentPage(item)">{{item.name}}</li>
      </ul>
    </div>
    <div class="row">
      <div class="col-9 border-right">
        <b-carousel
          id="carousel1"
          style="text-shadow: 1px 1px 2px #333;"
          controls
          indicators
          background="#ababab"
          :interval="0"
          :img-width="currentPage.width"
          :img-height="currentPage.height"
          v-model="slide"
          @sliding-start="onSlideStart"
          @sliding-end="onSlideEnd"
        >
          <!-- Slides with img slot -->
          <!-- Note the classes .d-block and .img-fluid to prevent browser default image alignment -->
          <b-carousel-slide v-for="(item, index) in banners" :key="index">
            <img slot="img" class="d-block img-fluid w-100" :src="item.img" alt="image slot">
            <h2>{{item.title}}</h2>
            <p>{{item.text}}</p>
          </b-carousel-slide>
        </b-carousel>
      </div>
      <div class="col-3 banner-tools py-3">
        <p class="lead py-2 border-bottom">
          <i class="fas fa-wrench mr-1 text-info"></i>设定
          <small class="float-right">《{{currentPage.name}}》</small>
        </p>

        <div>
          <b-form-group horizontal label="宽度:" label-class="text-sm-right" label-size="sm" label-for="nestedStreet">
            <b-input-group append="px">
              <b-form-input id="nestedStreet" v-model="currentPage.width" size="sm"></b-form-input>
            </b-input-group>
          </b-form-group>
          <b-form-group horizontal label="高度:" label-class="text-sm-right" label-size="sm" append="px" label-for="nestedCity">
            <b-input-group append="px">
              <b-form-input id="nestedCity" v-model="currentPage.height" size="sm"></b-form-input>
            </b-input-group>
          </b-form-group>
        </div>
        <hr class="border-light">
        <b-button-toolbar aria-label="Toolbar with button groups and dropdown menu" class="my-3" style="justify-content:center;">
          <b-button-group class="mx-1 mb-1" size="sm">
            <b-btn>新增</b-btn>
            <b-btn>删除</b-btn>
          </b-button-group>
          <b-input-group size="sm" class="w-25 mx-1 mb-1" style="min-width:100px;">
            <b-form-select v-model="slide">
              <option v-for="(item,index) in banners" :key="index" :value="index">第{{index+1}}张</option>
            </b-form-select>
          </b-input-group>
          <b-button-group class="mx-1 mb-1" size="sm">
            <b-btn>保存</b-btn>
            <b-btn>取消</b-btn>
          </b-button-group>
        </b-button-toolbar>
        <div>
          <b-form-group horizontal label="图片:" label-class="text-sm-right" label-size="sm" label-for="pic">
            <b-input-group>
              <b-form-input id="pic" placeholder="imgUrl" size="sm"></b-form-input>
              <b-input-group-append>
                <b-btn size="sm" variant="primary">选择</b-btn>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>

          <b-form-group horizontal label="主标题:" label-class="text-sm-right" label-size="sm" label-for="nestedState">
            <b-form-input id="nestedState" v-model="currentBanner.title" size="sm"></b-form-input>
          </b-form-group>
          <b-form-group horizontal label="附加文字:" label-class="text-sm-right" label-size="sm" label-for="nestedCountry">
            <b-form-textarea id="nestedCountry" v-model="currentBanner.text" :rows="3" size="sm" :max-rows="6"></b-form-textarea>
          </b-form-group>
          <b-form-group horizontal label="水平位置:" label-class="text-sm-right" label-size="sm" class="mb-0">
            <b-form-radio-group size="sm" :options="['左侧', '居中', '右侧']" v-model="currentBanner.column"/>
          </b-form-group>
          <b-form-group horizontal label="垂直位置:" label-class="text-sm-right" label-size="sm" class="mb-0">
            <b-form-radio-group size="sm" :options="['顶部', '居中', '底部']" v-model="currentBanner.row"/>
          </b-form-group>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  data() {
    return {
      //版面设定
      pages: [
        {
          name: '首页',
          width: 1920,
          height: 600,
          imgs: [
            {
              img: 'https://picsum.photos/1024/480/?image=52',
              url: '',
              title: '虚拟主机',
              text: '独立主机，多重安全防护，本地线路更流畅',
              column: '左侧',
              row: '居中'
            },
            {
              img: 'https://picsum.photos/1024/480/?image=54',
              url: '',
              title: 'abc',
              text: '独立主机，多重安全防护，本地线路更流畅',
              column: '左侧',
              row: '居中'
            },
            {
              img: 'https://picsum.photos/1024/480/?image=58',
              url: '',
              title: 'tt',
              text: '独立主机，多重安全防护，本地线路更流畅',
              column: '左侧',
              row: '居中'
            }
          ]
        },
        {
          name: '公司简介',
          width: 1920,
          height: 600,
          imgs: [
            {
              img: 'https://picsum.photos/1024/480/?image=52',
              url: '',
              title: '虚拟主机',
              text: '独立主机，多重安全防护，本地线路更流畅',
              column: '左侧',
              row: '居中'
            },
            {
              img: 'https://picsum.photos/1024/480/?image=54',
              url: '',
              title: '虚拟主机',
              text: '独立主机，多重安全防护，本地线路更流畅',
              column: '左侧',
              row: '居中'
            },
            {
              img: 'https://picsum.photos/1024/480/?image=58',
              url: '',
              title: '虚拟主机',
              text: '独立主机，多重安全防护，本地线路更流畅',
              column: '左侧',
              row: '居中'
            }
          ]
        }
      ],
      banners: [],
      currentPage: null,
      currentBanner: null,
      slide: 0,
      sliding: null
    }
  },
  watch: {
    slide(val) {
      this.currentBanner = this.banners[val]
    }
  },
  methods: {
    bindCurrentPage(item) {
      this.currentPage = item
    },
    onSlideStart(slide) {
      this.sliding = true
    },
    onSlideEnd(slide) {
      this.sliding = false
    }
  },
  created() {
    var that = this
    that.banners = that.pages[0].imgs
    that.currentBanner = that.banners[0]
    that.currentPage = that.pages[0]
  },
  mounted() {
    var that = this
    // 开发调试
    that.$nextTick(() => {
      that.$emit('reloadScroll')
    })
  }
}
</script>
<style scoped>
.row {
  margin-right: 15px;
}
.banner-tools {
  background-color: #374459;
  color: #fff;
}
.banner-tools > h5 {
  text-align: center;
  font-size: 80%;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 5px 0;
  color: #007bff;
}
.banner-choose {
  list-style: none;
  display: inline-block;
  padding: 0;
  margin: 0;
  text-align: center;
}
.banner-choose > li {
  list-style: none;
  display: inline-block;
  height: 40px;
  width: 100px;
  border: 1px solid #e9ecef;
  line-height: 38px;
  margin: 5px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.banner-choose > li:hover,
.banner-choose > li.active {
  background-color: #007bff;
  color: #fff;
}
</style>
