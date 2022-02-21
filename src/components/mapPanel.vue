<template>
  <div id="mapbody" class="map">
    <div
      v-if="visible"
      ref="allmap"
      class="allmap"
      :style="{ height: allMapHeight + 'px' }"
    >
      <slot></slot>
    </div>
    <div v-else class="noMap">{{ noMapText }}</div>
    <div
      ref="showText"
      class="hint"
      :style="{
        position: 'absolute',
        display: isShow,
        whiteSpace: 'nowrap'
      }"
    >
      单击打上标记
    </div>
    <div v-if="isShowSearch" class="searchContent">
      <Input
        v-model="keyWord"
        style="width: 150px"
        @keyup.enter.native="handleSearch"
      />
      <Button type="primary" size="small" @click="handleSearch">查询</Button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapPanel',
  props: {
    controlId: {
      //地图组件的组件id
      type: [String, Number],
      default: 20200901 //没有给ID就自己虚拟一个
    },
    longitude: {
      //地图经度
      type: [String, Number]
      // default: "114.085947",
    },
    latitude: {
      //地图纬度
      type: [String, Number]
      // default: "22.547",
    },
    initLongitude: {
      //初始化地图中心地图经度
      type: [String, Number]
    },
    initLatitude: {
      //初始化地图中心地图纬度
      type: [String, Number]
    },
    visible: {
      //是否显示地图，默认不显示
      type: Boolean,
      default: true
    },
    noMapText: {
      //不显示地图时的，默认文字，visible为false时有效
      type: String,
      default: '没有可视地图'
    },
    enableScrollWheel: {
      //地图滑轮滚动放大/缩小功能，默认不开启
      type: Boolean,
      default: true
    },
    isAddNavigation: {
      //添加地图导航控件，默认不添加
      type: Boolean,
      default: true
    },
    height: {
      type: [Number, String],
      default: 700
    },
    disabled: {
      //禁用地图标记功能，默认禁用
      type: Boolean,
      default: true
    },
    clickItem: {
      type: Object
    },
    isClearPoint: {
      // 是否清除标记点
      type: Boolean,
      default: false
    },
    updatePoint: {
      // 是否更新标记点
      type: Boolean,
      default: false
    },
    name: {
      //地图名
      type: String,
      default: 'mapPanel'
    },
    useType: {
      type: String
    },
    isShowSearch: {
      // 是否显示输入框
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      longitude_: this.longitude, //经度，测试数据 114.085947（深圳）
      latitude_: this.latitude, //纬度，测试数据 22.547（深圳）
      ak: 'WVLdUn8fOlutDVBKxcmg5ozHqSYXGIbi', //ak秘钥，debug可用，发布上线时请重新设置
      map: undefined, //地图容器
      mapWidth: 0, //地图宽度，用于限制鼠标移动范围
      mapheight: 0, //地图高度。用于限制鼠标移动范围
      isShow: 'none', //跟隨鼠标移动文字是否显示（block）\隐藏（none）
      allMapHeight: this.height > 0 ? this.height : 250, //地图容器的高度，设置100%会失效,默认设置250px
      lastMarker1: '',
      clickFN: this.mapMark,
      keyWord: ''
    }
  },
  computed: {},
  watch: {
    disabled(newVal) {
      if (!newVal) {
        this.map.addEventListener('click', this.clickFN, true)
        this.isShow = 'block'
        this.map.setDefaultCursor('url(../assets/mapFlag.cur) 9 18,auto')
      } else {
        this.isShow = 'none'
        this.map.setDefaultCursor(
          'url(http://api.map.baidu.com/images/openhand.cur) 8 8, default'
        )
        this.map.removeEventListener('click', this.clickFN, true) //注销事件
      }
    },
    isClearPoint(newVal) {
      if (newVal) {
        this.map.clearOverlays()
        this.map.removeEventListener('click', this.clickFN, true) //注销事件
        this.$emit('resetClear', {
          controlId: this.controlId,
          isClearPoint: false
        })
      }
    },
    updatePoint(newVal) {
      /* eslint-disable no-undef */
      if (newVal) {
        this.map.clearOverlays()
        let marker1 = new BMap.Marker(
          new BMap.Point(this.longitude, this.latitude)
        )
        this.map.addOverlay(marker1)
        // 地图初始化必须要调用centerAndZoom
        // 组件刚渲染时经纬度为空，会调用getCurrentPosition获取当前位置
        // 如果在getCurrentPosition获取到当前位置前调用了updatePoint，updatePoint所定位的点会被覆盖
        if (!this.isInit) {
          this.isInit = true
          this.map.centerAndZoom(
            new BMap.Point(this.longitude, this.latitude),
            14
          )
        } else {
          this.map.setCenter(new BMap.Point(this.longitude, this.latitude))
          if (this.useType == 'billInit') {
            this.map.setZoom(19)
          }
        }

        this.map.removeEventListener('click', this.clickFN, true) //注销事件
        this.$emit('resetUpdatePoint', {
          controlId: this.controlId,
          updatePoint: false
        })
      }
    }
  },
  mounted: function () {
    this.addHeadScript() //加载百度地图API
    this.$nextTick(function () {
      if (this.$parent.$el.offsetHeight > this.height) {
        this.allMapHeight = this.$parent.$el.offsetHeight //设置地图容器的高度，跟随父容器
      }
    })
  },
  methods: {
    remove_overlay() {
      console.log('remove_overlay')
      this.map.clearOverlays()
    },
    mapMark(e) {
      if (!this.disabled) {
        if (this.lastMarker1 == '') {
          this.map.removeEventListener('click', this.clickFN, true) //注销事件
          this.lastMarker1 = e
          this.$emit('mapMark', {
            controlId: this.controlId,
            longitude: e.point.lng, //标记点的经度
            latitude: e.point.lat, //标记点的纬度
            clickItem: this.clickItem,
            name: this.name ? this.name : 'mapMark'
          })
        } else if (this.lastMarker1 != e) {
          this.map.removeEventListener('click', this.clickFN, true) //注销事件
          this.lastMarker1 = e
          this.$emit('mapMark', {
            controlId: this.controlId,
            longitude: e.point.lng, //标记点的经度
            latitude: e.point.lat, //标记点的纬度
            clickItem: this.clickItem,
            name: this.name ? this.name : 'mapMark'
          })
        } else {
          this.map.removeEventListener('click', this.clickFN, true) //注销事件
          this.$emit('resetDisabled', {
            controlId: this.controlId,
            disabled: true
          })
        }
        // this.map.removeEventListener("click", this.mapMark); //注销事件
        this.map.clearOverlays()
        let marker1 = new BMap.Marker(new BMap.Point(e.point.lng, e.point.lat))
        this.map.addOverlay(marker1)
        // this.map.removeEventListener("click", this.mapMark); //注销事件
        this.isShow = 'none'
        this.map.setDefaultCursor(
          'url(http://api.map.baidu.com/images/openhand.cur) 8 8, default'
        )
      }
    },
    markMove(e) {
      let myhint = this.$refs.showText //跟随的文字
      const myMap = this.$refs.allmap //地图容器
      let mapLeft = e.clientX - myMap.getBoundingClientRect().left //地图容器在浏览器窗口的位置
      let mapTop = e.clientY - myMap.getBoundingClientRect().top
      let mapRight = e.clientX - myMap.getBoundingClientRect().right
      let mapBottom = e.clientY - myMap.getBoundingClientRect().bottom
      myhint.style.left = mapLeft + 10 + 'px' //offsetX以触发元素的内容为基准
      myhint.style.top = mapTop - 20 + 'px'

      if (mapLeft <= 5 || mapTop <= 5 || mapRight > -8 || mapBottom > -8) {
        myhint.style.display = 'none'
      } else {
        myhint.style.display = this.isShow
      }
    },
    createMap() {
      /* eslint-disable no-undef */
      //创建地图
      this.map = new BMap.Map(this.$refs.allmap, { enableMapClick: false }) //地图镶嵌的容器
      if (this.longitude_ && this.latitude_) {
        this.isInit = true
        this.map.centerAndZoom(
          new BMap.Point(this.longitude_, this.latitude_),
          19
        )
        this.map.clearOverlays()
        let marker1 = new BMap.Marker(
          new BMap.Point(this.longitude_, this.latitude_)
        )
        this.map.addOverlay(marker1)
      } else if (this.initLongitude && this.initLatitude) {
        this.isInit = true
        this.map.centerAndZoom(
          new BMap.Point(this.initLongitude, this.initLatitude),
          19
        ) //19代表缩放级别，越小则缩放程度越大
      } else {
        // 定位到当前位置
        const self = this
        let geolocation = new BMap.Geolocation()
        geolocation.getCurrentPosition(
          function (r) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS && !self.isInit) {
              self.isInit = true
              self.map.centerAndZoom(
                new BMap.Point(r.point.lng, r.point.lat),
                19
              )
            }
          },
          { enableHighAccuracy: true }
        )
      }

      if (this.isAddNavigation) {
        this.map.addControl(new BMap.NavigationControl()) //添加导航控件
      }
      if (this.enableScrollWheel) {
        this.map.enableScrollWheelZoom() //鼠标滚动放大缩小，默认不开启
      }
      if (!this.disabled) {
        this.isShow = 'block'
        this.map.setDefaultCursor('url(../assets/mapFlag.cur) 9 18,auto')
        this.map.addEventListener('click', this.clickFN, true)
      }
      document
        .getElementById('mapbody')
        .addEventListener('mousemove', this.markMove)
      this.mapWidth = this.map.width
      this.mapheight = this.map.height
    },
    addHeadScript() {
      //HTML头部，动态添加百度地图API密钥
      let script = document.createElement('script')
      script.type = 'text/javascript'
      if (process.env.NODE_ENV === 'development') {
        script.src =
          'http://api.map.baidu.com/api?v=2.0&ak=' + this.ak + '&callback=init'
      } else {
        script.src =
          'https://api.map.baidu.com/api?v=2.0&ak=' + this.ak + '&callback=init'
      }

      document.head.appendChild(script)

      window.init = () => {
        //地图初始化，回调里调用
        this.createMap() //创建地图
      }
    },
    handleSearch() {
      /* eslint-disable no-undef */
      const { keyWord } = this
      if (!this.localSearch) {
        this.localSearch = new BMap.LocalSearch(this.map, {
          // 搜索的回调，取第一条数据做定位
          onSearchComplete: (results) => {
            // 判断状态是否正确
            if (
              this.localSearch.getStatus() == BMAP_STATUS_SUCCESS &&
              results.getCurrentNumPois()
            ) {
              const addres = results.getPoi(0)
              const point = new BMap.Point(addres.point.lng, addres.point.lat)
              const marker = new BMap.Marker(point) // 创建标注
              this.map.centerAndZoom(point, 17)
              this.map.addOverlay(marker)
            }
          }
        })
      }
      // 清除标记
      this.map.clearOverlays()
      this.localSearch.search(keyWord)
    }
  }
}
</script>

<style scoped>
.map {
  width: 100%;
  height: 100%;
  margin: 0;
  font-family: '微软雅黑';
}
.noMap {
  font-size: 16px;
  font-weight: bold;
  margin-left: 10%;
  margin-top: 20px;
}
.allmap {
  width: 100%;
}
.hint {
  position: absolute;
}
.searchContent {
  position: absolute;
  top: 0;
  right: 20px;
}
</style>
