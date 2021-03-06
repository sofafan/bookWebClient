import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Router } from '@angular/router';
import { UsersService } from './../services/users.service';
import { OrdersService } from './../services/orders.service';
import { ReceiveService } from './../services/receive.service';

@Component({
  selector: 'app-paysecond',
  templateUrl: './paysecond.component.html',
  styleUrls: ['./paysecond.component.css'],
  providers: [ UsersService,OrdersService,ReceiveService ]
})
export class PaysecondComponent implements OnInit {
  book_id: any;
  order_num: any;
  price: any;
  receive_id:any;
  checked_address:any;
  _user: any;
  order_numbering: string="";
  m:any='30';
  s:any='00';
  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private userSer: UsersService,
    private OrdersService: OrdersService,
    private ReceiveService: ReceiveService,
  ) { }

  ngOnInit() {
    if(!sessionStorage.getItem('user_id')){
      this.router.navigate(['/login']);
    }
    window.scrollTo(0,0);
    this.book_id = this.route.snapshot.paramMap.get('book_id');
    this.order_num = this.route.snapshot.paramMap.get('order_num');
    this.price = this.route.snapshot.paramMap.get('price');
    this.receive_id = this.route.snapshot.paramMap.get('receive_id');

    let str = '{"user_id":' + sessionStorage.getItem('user_id') + '}';
    let user_id = JSON.parse(str);
    let that = this;
    that.userSer.getMoreById(user_id, function (result) {
      if(!result.statusCode) {
        that._user = result[0];
      }
    });
    let str2 = '{"receive_id":'+ this.receive_id +'}';
    let receive_id = JSON.parse(str2);
    that.ReceiveService.checkedAddress(receive_id, function (result) {
      // console.log("H_______");
      // console.log(result);
      if(!result.statusCode) {
        that.checked_address = result[0];
      }
    });

    //创建唯一订单号
    this.createOrderNum();
    // console.log(this.order_numbering);

    //倒计时
    let d = new Date("1111/1/1,0:30:00");
    let interval = setInterval(function () {
      that.m = d.getMinutes();
      that.s = d.getSeconds();
      that.m = that.m < 10 ? "0" + that.m : that.m;
      that.s = that.s < 10 ? "0" + that.s : that.s;
      if (that.m == 0 && that.s == 0) {
        //倒计时结束清除interval
        clearInterval(interval);
        //到支付超时路由
        that.router.navigate(['/payovertime']);
      }
      d.setSeconds(that.s - 1);
    },1000)
  }
  pay(){
    let that = this;
    let str = '{"book_id":'+ this.book_id +',"user_id":'+sessionStorage.getItem('user_id')+',"order_num":'+this.order_num+',"order_bianhao":'+this.order_numbering+',"receive_name":"'+this.checked_address.receive_name+'","receive_address":"'+this.checked_address.receive_address+'","receive_phone":"'+this.checked_address.receive_phone+'"}';
    let order = JSON.parse(str);
    // console.log(booklove);
    that.OrdersService.addOrder(order,function (result) {
        console.log(result);
        if (result.statusCode==91) {
          that.router.navigate(['/paysuccess',that.price,that.order_numbering,that.receive_id]);
        }else {
          that.router.navigate(['/**']);
        }
    });
  }

  //创建唯一的订单号
  createOrderNum(){
    let nowtime = new Date();
    this.order_numbering+=nowtime.getFullYear();
    if(nowtime.getMonth()<9){
      this.order_numbering = this.order_numbering+"0"+(nowtime.getMonth()+1);
    }else{
      this.order_numbering = this.order_numbering+(nowtime.getMonth()+1);
    }
    if(nowtime.getDate()<10){
      this.order_numbering = this.order_numbering+"0"+nowtime.getDate();
    }else{
      this.order_numbering = this.order_numbering+nowtime.getDate();
    }
    if(nowtime.getHours()<10){
      this.order_numbering = this.order_numbering+"0"+nowtime.getHours();
    }else{
      this.order_numbering = this.order_numbering+nowtime.getHours();
    }
    if(nowtime.getMinutes()<10){
      this.order_numbering = this.order_numbering+"0"+nowtime.getMinutes();
    }else{
      this.order_numbering = this.order_numbering+nowtime.getMinutes();
    }
    if(nowtime.getSeconds()<10){
      this.order_numbering = this.order_numbering+"0"+nowtime.getSeconds();
    }else{
      this.order_numbering = this.order_numbering+nowtime.getSeconds();
    }
    this.order_numbering = this.order_numbering+sessionStorage.getItem('user_id')+this.book_id+this.order_num;
  }
}
