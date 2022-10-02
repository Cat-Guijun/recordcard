// pages/index/index.js
function getTime(){
	let date=new Date()
	return  date.getFullYear()+"/"+(date.getMonth()+1)+'/'+date.getDate()
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
		ischecked:false,
    sysArray:["请选择院系","机械工程系","电子信息工程系","通信工程系","信息工程系","工业设计系"],
    sysindex:0,
    name:null,
    studentid:null,
    place:"", //地理位置
    studentidplace:"",
		nameplace:"",
		timelist:[],
		placelist:[]
  },
	async getAddr(){
		console.log("ok")
		const res= await wx.getLocation({
			type: "wgs84",
		})
		 wx.request({
			url: 'https://apis.map.qq.com/ws/geocoder/v1/',
			method: 'GET',
			data: {
				location: `${res.latitude},${res.longitude}`,
				key: '你的key'
			},
			success:(res) => {
				console.log('地址', res);
				let {city,district}=res.data.result.address_component
				this.setData({
					place:city+district
				})
		}})
	},

	bindchangeSys(e){
		this.setData({
			sysindex:e.detail.value
		})
	},
	bindKeyInput(e){
    this.setData({
      studentid: e.detail.value
    })
	},
	bindKeyInput2(e){
    this.setData({
      name: e.detail.value
    })
  },
	async submitinfo(e){
		if(this.data.studentid.length!=12){
			wx.showToast({
				title: '你的学号不正确',
				icon:"error"
			})
			return
		}
		if(this.data.studentid==null || this.data.name==null||this.data.sysindex==0){
				wx.showToast({
					title: '信息不完善',
					icon:"error"
				})
		}else{
				try{
					let {data}=await this.queryinfo() //查询信息
					console.log(data)
					if(data.length==0){
						this.setData({
							timelist:[getTime()],
							placelist:[this.data.place]
						})
						this.uploadinfo(false)
					}else{
						if(data[0].record_time.length>=7){
							data[0].record_time.pop()
							data[0].location.pop()
						}
						this.setData({
							timelist:[getTime(),...data[0].record_time],
							placelist:[this.data.place,...data[0].location]
						})
						this.uploadinfo(true)
					}
				}catch(e){
					console.log(e)
				}
		}
	},
	queryinfo(){
		const db = wx.cloud.database()
		return db.collection('studentinfo').where({
			"s_id":this.data.studentid,
			"_openid": 'o4X-u5ZvT6Ib7OXVYOVafPA0mlkQ'
		})
		.get()
	},
	uploadinfo(flag){
		const db = wx.cloud.database()
		let coll=db.collection("studentinfo")
		let obj={
			"acade":this.data.sysArray[this.data.sysindex],
			"location":this.data.placelist,
			"name":this.data.name,
			"record_time":this.data.timelist,
			"s_id":this.data.studentid,
			"is_ok":true
		}
		console.log(obj)
		this.saveobj(obj)
		if(flag){
			// 改信息
			let temp=this
			console.log("?")
			coll.where({
				s_id: obj.s_id
			}).update({
				data: {
					...obj},
					success: function(res) {
						// res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
						console.log(res)
						wx.showToast({
							title: '打卡成功',
							success:(e)=>{
								console.log("i am ok!!")
								temp.setData({
									ischecked:true
								})
							}
						})
					}
				}
			)
		}else{
			//添加信息
			let temp=this
			coll.add({
				data:{...obj},
				success: function(res) {
					// res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
					console.log(res)
					wx.showToast({
						title: '打卡成功',
						success:(e)=>{
							console.log("i am ok!!")
							temp.setData({
								ischecked:true
							})
						}
					})
				}
			})
		}
	},
	saveobj(obj){
		let {name,is_ok,s_id}=obj
		wx.setStorageSync('sinfo', JSON.stringify({
			s_id,
			name,
			sysindex:this.data.sysindex,
			checked:is_ok,
			timestamp:new Date().getDay()
		}))
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		let stuInfo=wx.getStorageSync('sinfo')
    if(stuInfo!=""){
			stuInfo=JSON.parse(stuInfo)
			let nDay=new Date().getDay()
			let bol=(nDay-stuInfo.timestamp>0||(nDay==0&&stuInfo.timestamp==6))?false:true
      this.setData({
        studentid:stuInfo.s_id,
        name:stuInfo.name,
				sysindex:stuInfo.sysindex,
				ischecked:bol
      })
    }else{
      this.setData({
        studentidplace:"请输入学号",
        nameplace:"请输入名字",
        sysindex:0
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
		this.getAddr()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
			
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})