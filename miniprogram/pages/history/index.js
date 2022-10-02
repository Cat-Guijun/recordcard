// pages/history/index.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		studentid:"",
		init:false,
		timelist:[],
		placelist:[]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	queryinfo(studentid){
		const db = wx.cloud.database()
		return db.collection('studentinfo').where({
			"s_id":studentid,
			"_openid": 'o4X-u5ZvT6Ib7OXVYOVafPA0mlkQ'
		})
		.get()
	},
	async onShow() {
		let stuInfo=wx.getStorageSync('sinfo')
    if(stuInfo!=""){
			this.setData({
				init:false
			})
      stuInfo=JSON.parse(stuInfo)
      this.setData({
        studentid:stuInfo.s_id
			})
			try{
				let {data}=await this.queryinfo(stuInfo.s_id)
				console.log(data)
				if(data.length==0){
						this.setData({
							init:true
						})
				}else{
					this.setData({
						timelist:[...data[0].record_time],
						placelist:[...data[0].location]
					})
				}
			}catch(e){
				console.log(e)
			}
    }else{
			this.setData({
				init:true
			})
    }
	},

	/**
	 * 生命周期函数--监听页面显示
	 */


	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})