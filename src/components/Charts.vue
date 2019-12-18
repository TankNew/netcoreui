<style scoped>
.setting-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
}
.setting-container > div {
  border: 1px solid #e9ebef;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}
.w-2 {
  width: calc(75% - 20px);
  height: 550px;
}
.w-1 {
  width: calc(25% - 20px);
  height: 550px;
}
.w-0 {
  width: calc(25% - 20px);
  height: 100px;
}
.w-0 i {
  font-size: 40px;
}
.w-33 {
  width: calc(33% - 20px);
  height: 550px;
  padding: 0 !important;
}
</style>
<template>
  <section class="container-fluid setting-container">
    <p class="lead w-100">
      <i class="far fa-chart-bar text-primary mr-1"></i>站点统计
    </p>
    <div class="w-0">
      <div class="text-primary">
        <i class="far fa-folder text-primary mr-1"></i>
        <div class="float-right">
          <span>总计：115</span>
        </div>
      </div>
      <div class="clear">
        <span class="small">网站空间占用</span>
        <div class="progress" style="height: 2px;">
          <div class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    </div>
    <div class="w-0">
      <div class="text-primary">
        <i class="far fa-file text-primary mr-1"></i>
        <div class="float-right">
          <span>总计：115</span>
        </div>
      </div>
      <div class="clear">
        <span class="small">
          文件
          <em class="float-right small">占比：25%</em>
        </span>
        <div class="progress" style="height: 2px;">
          <div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    </div>
    <div class="w-0">
      <div class="text-primary">
        <i class="far fa-image text-primary mr-1"></i>
        <div class="float-right">
          <span>总计：115</span>
        </div>
      </div>
      <div class="clear">
        <span class="small">
          图片
          <em class="float-right small">占比：25%</em>
        </span>
        <div class="progress" style="height: 2px;">
          <div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    </div>
    <div class="w-0">
      <div class="text-primary">
        <i class="far fa-file-video text-primary mr-1"></i>
        <div class="float-right">
          <span>总计：115</span>
        </div>
      </div>
      <div class="clear">
        <span class="small">
          视频
          <em class="float-right small">占比：25%</em>
        </span>
        <div class="progress" style="height: 2px;">
          <div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    </div>
    <div class="w-2">
      <p class="lead">网站访问量</p>
      <line-chart :chart-data="datacollection" :options="options"></line-chart>
      <div class="text-center my-3">
        <b-button-toolbar key-nav aria-label="Toolbar with button groups" class="d-inline-block">
          <b-button-group class="mx-1">
            <b-btn>&laquo;</b-btn>
            <b-btn>&lsaquo;</b-btn>
          </b-button-group>
          <b-button-group class="mx-1">
            <b-btn>年</b-btn>
            <b-btn>月</b-btn>
            <b-btn>日</b-btn>
          </b-button-group>
          <b-button-group class="mx-1">
            <b-btn>&rsaquo;</b-btn>
            <b-btn>&raquo;</b-btn>
          </b-button-group>
        </b-button-toolbar>
      </div>
    </div>
    <div class="w-1">
      <p class="lead">访问来源统计</p>
      <pie-chart :chart-data="dataPie" :options="options"></pie-chart>
    </div>
  </section>
</template>
<script>
import LineChart from '../plugins/LineChart.js'
import PieChart from '../plugins/PieChart.js'

export default {
  components: {
    LineChart,
    PieChart
  },
  data() {
    return {
      datacollection: null,
      dataPie: null,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    }
  },
  mounted() {
    this.fillData()
  },
  methods: {
    fillData() {
      this.datacollection = {
        labels: ['9月', '10月', '11月', '12月', '9月', '10月'],
        datasets: [
          {
            label: '单日最少',
            backgroundColor: '#33CC66',
            data: [111, 120, 111, 120, 111, 120]
          },
          {
            label: '单日最多',
            backgroundColor: '#6699FF',
            data: [200, 350, 200, 350, 200, 200]
          }
        ]
      }
      this.dataPie = {
        labels: ['Android', 'Iphone', 'Mac', 'Windows', '其它'],
        datasets: [
          {
            label: '单日最少',
            backgroundColor: [
              '#33CC66',
              '#FF6666',
              '#6699FF',
              '#9999FF',
              '#FF9966'
            ],
            data: [1, 2, 3, 4, 5]
          }
        ]
      }
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    }
  }
}
</script>
