let TaiXiu_User  = require('../../Models/TaiXiu_user');
var LScuoc        = require('../../Models/LichSu_Cuoc');
var ChuyenRed = require('../../Models/ChuyenRed');
var UserInfo  = require('../../Models/UserInfo');
var tab_DaiLy = require('../../Models/DaiLy');
var OTP       = require('../../Models/OTP');
var Phone     = require('../../Models/Phone');
var validator = require('validator');
var Helper    = require('../../Helpers/Helpers');
var nTmux 	= require('node-tmux');
var fs = require('fs');

module.exports = function(client, data){
	if (!!data && !!data.name && !!data.otp) {
		if (!validator.isLength(data.name, {min: 3, max: 17})) {
			client.red({notice: {title: 'LỖI', text: 'Tên nhân vật không hợp lệ.!'}});
		}else if (!validator.isLength(data.otp, {min: 4, max: 6})) {
			client.red({notice: {title: 'LỖI', text: 'Mã OTP không hợp lệ.!'}});
		}else{
			var red  = data.red>>0;
			var name = ''+data.name+'';
			var otp  = data.otp;
            TaiXiu_User.findOne({'uid':client.UID}, {}, function(err, checkk){
				if (checkk){
					var play = checkk.tRedPlay;
					if(play < 100000){
						client.red({notice:{title:'CHUYỂN GOLD', text:'Bạn chưa đủ điều kiện để chuyển GOLD'}});
					}
					else{
						
				
			if(validator.isEmpty(name) ||
				red < 10000 ||
				name.length > 17 ||
				name.length < 3 ||
				otp.length != 4)
			{
				client.red({notice:{title:'CHUYỂN K', text:'Kiểm tra lại các thông tin.!'}});
			}else{
				Phone.findOne({'uid':client.UID}, {}, function(err, check){
					if (check) {
						OTP.findOne({'uid':client.UID, 'phone':check.phone}, {}, {sort:{'_id':-1}}, function(err, data_otp){
							if (data_otp && otp == data_otp.code) {
								if (((new Date()-Date.parse(data_otp.date))/1000) > 180 || data_otp.active) {
									client.red({notice:{title:'LỖI', text:'Mã OTP đã hết hạn.!'}});
								}else{
									name = name.toLowerCase();
									var active1 = tab_DaiLy.findOne({$or:[
										{nickname:name},
										{nickname:client.profile.name}
									]}).exec();
									var active2 = UserInfo.findOne({name:name}, 'id name red').exec();
									var active3 = UserInfo.findOne({id:client.UID}, 'red').exec();
									Promise.all([active1, active2, active3])
									.then(valuesCheck => {
										var daily = valuesCheck[0];
										var to    = valuesCheck[1];
										var user  = valuesCheck[2];
										if (!!to) {
											if (to.id == client.UID) {
												client.red({notice:{title:'CHUYỂN GOLD',text:'Bạn không thể chuyển cho chính mình.!!'}});
											}else{
												if (user == null || (user.red-10000 < red)) {
													client.red({notice:{title:'CHUYỂN GOLD',text:'Số dư không khả dụng.!!'}});
												}else{
													UserInfo.updateOne({id: client.UID}, {$inc:{red:-red}}).exec();
													client.red({notice:{title:'CHUYỂN GOLD', text: 'Giao dịch thành công.!!'}, user:{red:user.red-red}});
													//LScuoc.create({uid:client.UID, bet:-red,  select:select, bet:bet, thanhtoan:0, tienhienco:user.red, game:'CHUYỂN GOLD', time:new Date()});
													LScuoc.create({'uid':client.UID, 'dichvu':'DV CHUYỂN GOLD', 'betwin':-red, 'bet':-red, 'lswin':-red, 'tienhienco':user.red-red, 'phien':to.name, 'select':1, time:new Date()});
													var thanhTien = !!daily ? red : Helper.anPhanTram(red, 1, 2);
													var create = {'from':client.profile.name, 'to':to.name, 'red':red, 'red_c':thanhTien, 'time': new Date()};
													if (void 0 !== data.message && !validator.isEmpty(data.message.trim())) {
														create = Object.assign(create, {message: data.message});
													}
													ChuyenRed.create(create);
													UserInfo.updateOne({name: to.name}, {$inc:{red:thanhTien}}).exec();
													if (void 0 !== client.redT.users[to.id]) {
														Promise.all(client.redT.users[to.id].map(function(obj){
															LScuoc.create({'uid':to.id, 'dichvu':'DV CHUYỂN GOLD', 'betwin':thanhTien, 'lswin':thanhTien, 'tienhienco':to.red*1+thanhTien, 'phien':client.profile.name, 'select':1, time:new Date()});
															obj.red({notice:{title:'CHUYỂN GOLD', text:'Bạn nhận được ' + Helper.numberWithCommas(thanhTien) + ' GOLD.' + '\n' + 'Từ người chơi: ' + client.profile.name}, user:{red: to.red*1+thanhTien}});
															//obj.red({notice:{title:'CHUYỂN GOLD', text:'Bạn nhận được ' + Helper.numberWithCommas(thanhTien) + ' GOLD.' + '\n' + 'Từ người chơi: ' + client.profile.name}, user:{red: to.red*1+thanhTien}});
														}));
													}
                                                   /* UserInfo.updateOne({name: to.name},{ $inc: { red: +red } },
                                                          function(err,result){
                                                           nTmux.tmux().then(tm => {
                                                              tm.writeInput("tele","dialog_list",true);
                                                              setTimeout(() => {
                                                              tm.writeInput("tele","msg "+userAuth.nickname+" "+"'",false);
                                                              setTimeout(() => {
                                                              tm.writeInput("tele","R-So Du Thay Doi:",false);
                                                              setTimeout(() => {
                                                              tm.writeInput("tele",'\\n',false);
                                                              setTimeout(() => {
                                                              tm.writeInput("tele","TANG: "+Helper.numberWithCommas(red)+" - So Du Cuoi "+Helper.numberWithCommas(result.red + red),false);
                                                              setTimeout(() => {
                                                              tm.writeInput("tele",'\\n',false);
                                                              setTimeout(() => {
                                                              tm.writeInput("tele","Ly Do: Nhan R tu User : "+client.profile.name,false);
                                                              setTimeout(() => {
                                                              tm.writeInput("tele",'\\n',false);
                                                              setTimeout(() => {
                                                               var time = new Date().toLocaleString("en-US", {timeZone: "Asia/Saigon"});
                                                                 time = new Date(time);
                                                              tm.writeInput("tele","Thoi Gian:"+time.toLocaleString()+"'",false);
                                                             },10);
                                                             },10);
                                                             },10);
                                                             },10);
                                                             },10);
                                                             },10);
                                                             },10);
                                                             },10);

                                                           }).catch(() => {
                                                           });
                                                          }) */
													OTP.updateOne({'_id':data_otp._id.toString()}, {$set:{'active':true}}).exec();
												}
											}
										}else{
											client.red({notice:{title:'CHUYỂN GOLD',text:'Người dùng không tồn tại.!!'}});
										}
									})
								}
							}else{
								client.red({notice:{title:'LỖI', text:'Mã OTP Không đúng.!'}});
							}
						});
					}else{
						client.red({notice:{title: 'THÔNG BÁO', text: 'Chức năng chỉ dành cho tài khoản đã kích hoạt.'}});
					}
				});
			}
			
				}
				}
			});
			
			
		}
	}
}