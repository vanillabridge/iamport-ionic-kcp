# iamport-ionic-kcp

[아임포트](http://www.iamport.kr) KCP결제를 ionic2, ionic3 환경에서 사용할 수 있도록 만든 플러그인입니다.(휴대폰 본인인증 포함)  

## 준비 사항  
결제테스트까지 수행하기 위해서는 [아임포트 관리자 페이지](https://admin.iamport.kr) 에서 계정 생성이 필요합니다.  
계정 생성 후 시스템 설정 > 내정보에서 발급된 `가맹점식별코드` 확인이 필요합니다.  

## 설치  

결제연동을 위해 Cordova 플러그인 설치가 먼저 필요합니다.  
Cordova 플러그인은 [inappbrowser(fork 버전)](https://github.com/iamport/cordova-plugin-inappbrowser) dependency를 가지고 있습니다.  

아래 명령어에 기재된 `ionickcp`는 실제 사용을 원하는 scheme 값으로 대체하여 설치하면 됩니다.  

```bash
ionic cordova plugin add cordova-plugin-iamport-kcp --variable URL_SCHEME=ionickcp --save
```

결제기능을 angular service 로 제공하기 위해 ionic 플러그인 설치가 필요합니다.  

```bash
$ npm install iamport-ionic-kcp --save
```


## 적용 방법  

`iamport-ionic-kcp`플러그인이 npm에서 정상 설치가 완료된 후, 프로젝트의 Angular `Module`에 `IamportService`를 등록해줍니다.  


```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// IamportService 불러오기
import { IamportService } from 'iamport-ionic-kcp';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // Specify your library as an import
    LibraryModule
  ],
  providers: [
    IamportService, //provider에 IamportService를 등록
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Angular `Module`에 정상적으로 등록되면, Page에서 IamportService를 로드해 사용할 수 있습니다. 

```typescript
import { IamportService } from 'iamport-ionic-kcp';

@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html'
})
export class PaymentPage {

  constructor(public navCtrl: NavController, public iamport: IamportService) {

  }

  payment(event) {
    const param = {
      pay_method : 'card',
      merchant_uid : 'merchant_' + new Date().getTime(),
      name : '주문명:결제테스트',
      amount : 1400,
      buyer_email : 'iamport@siot.do',
      buyer_name : '구매자이름',
      buyer_tel : '010-1234-5678',
      buyer_addr : '서울특별시 강남구 삼성동',
      buyer_postcode : '123-456',
      app_scheme : 'ionickcp' //플러그인 설치 시 사용한 명령어 "ionic cordova plugin add cordova-plugin-iamport-kcp --variable URL_SCHEME=ionickcp" 의 URL_SCHEME 뒤에 오는 값을 넣으시면 됩니다.
    };
    
    // 아임포트 관리자 페이지 가입 후 발급된 가맹점 식별코드를 사용
    this.iamport.payment("가맹점 식별코드", param )
      .then((response)=> {
        if ( response.isSuccess() ) {
            //TODO : 결제성공일 때 처리
        }
      })
      .catch((err)=> {
        alert(err)
      })
    ;
  }

}

```

```xml
<button (click)="payment()">결제하기</button>
```

## 부가기능 : 휴대폰 본인인증

`cordova-plugin-iamport-kcp` 플러그인 버전 0.9.3 버전 이상을 요구합니다.

```typescript
import { IamportService } from 'iamport-ionic-kcp';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  constructor(public navCtrl: NavController, public iamport: IamportService) {

  }

  certification(event) {
    const param = {
      merchant_uid : 'merchant_' + new Date().getTime() //본인인증과 연관된 가맹점 내부 주문번호가 있다면 넘겨주세요
    };

    this.iamport.certification("가맹점 식별코드", param)
      .then((response)=> {
        if ( response.isSuccess() ) {
            //TODO : 본인인증 성공일 때 처리
            alert("성공! imp_uid : " + response.getImpUid() + "\nmerchant_uid : " + response.getMerchantUid());
        } else {
            //TODO : 본인인증 실패일 때 처리
          alert("실패 imp_uid : " + response.getImpUid() + "\nmerchant_uid : " + response.getMerchantUid());
        }
      })
      .catch((err)=> {
        alert(err)
      })
    ;
  }

}
```

```xml
<button (click)="certification()">본인인증</button>
```


## 해결되지 않은 문제점  

안드로이드에서는 비교적 충분히 테스트되었으나, iOS에서는 일부 문제가 있습니다. 

1. 앱 구동 후 최초로 inappbrowser가 open되었을 때에는 결제가 진행되지않고, 닫은 후 두 번째 open을 해야지만 결제가 진행되는 현상
2. 외부 app scheme으로 이동하는 코드가 호출되지 않아 외부 앱으로 빠져나가지 못하는 증상  

## License

MIT © [iamport](mailto:support@iamport.kr)