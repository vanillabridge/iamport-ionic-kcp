import { Injectable } from '@angular/core';
import { IamportPayment } from "./iamport.payment";
import { IamportCertification } from "./iamport.certification";
import { Platform } from "ionic-angular";
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Injectable()
export class IamportService {

    constructor(private platform: Platform, private inAppBrowser: InAppBrowser) {

    }

    private static parseQuery(query: string) {
        let obj = {},
            arr = query.split('&');

        for (let element of arr) {
            const pair = element.split("=" );
            const key = decodeURIComponent(pair[0]);
            const val = decodeURIComponent(pair[1]);

            if ( key === "imp_success" ) {
                obj[ "success" ] = ("true" === val); //string 을 boolean 으로
            } else {
                obj[ key ] = val;
            }
        }

        return obj;
    }

    public payment(userCode: string, param): Promise<IamportPayment> {
        const promise = new Promise<IamportPayment>((resolve, reject) => {
            this.platform.ready().then(()=> {
                const paymentUrl = 'iamport-checkout.html?user-code=' + userCode;
                const redirectUrl = "http://localhost/iamport";
                const browser = this.inAppBrowser.create(paymentUrl,'_system', 'location=no');
                let paymentProgress = false;

                param.m_redirect_url = redirectUrl;

                browser.on("loadstart" )
                    .subscribe(
                        (e) => {
                            if ( e.url.startsWith(redirectUrl) ) {
                                const query  = e.url.substring( redirectUrl.length+1 );
                                const data = IamportService.parseQuery(query);

                                resolve(new IamportPayment(data));
                                browser.close();
                            }
                        }
                    );

                browser.on("loadstop" )
                    .subscribe(
                        (e) => {
                            if ( !paymentProgress && (e.url).indexOf(paymentUrl) > -1 ) {
                                paymentProgress = true;

                                const inlineCallback = `(rsp) => {
                                                        if( rsp.success ) {
                                                            location.href = '${redirectUrl}?imp_success=true&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid+'&vbank_num='+rsp.vbank_num+'&vbank_name='+rsp.vbank_name;
                                                        } else {
                                                            location.href = '${redirectUrl}?imp_success=false&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid+'&error_msg='+rsp.error_msg;
                                                        }
                                                   }`;
                                const iamport_script = `IMP.request_pay(${JSON.stringify(param)}, ${inlineCallback})`;

                                browser.executeScript({
                                    code : iamport_script
                                });
                            }
                        }, (e) => {

                        }
                    );

                browser.on("exit" )
                    .subscribe(
                        (e) => {
                            reject("사용자가 결제를 취소하였습니다.");
                        }
                    );

                browser.show();
            });
        });

        return promise;
    }

    public certification(userCode: string, param): Promise<IamportCertification> {
        const promise = new Promise<IamportCertification>((resolve, reject) => {
            this.platform.ready().then(() => {
                const certificationUrl = 'iamport-checkout.html?user-code=' + userCode;
                const redirectUrl = "http://localhost/iamport-certification";
                const browser = this.inAppBrowser.create(certificationUrl, '_system', 'location=no');

                let certificationProgress = false;

                browser.on("loadstart" )
                    .subscribe(
                        (e) => {
                            if ( e.url.startsWith(redirectUrl) ) {
                                const query  = e.url.substring( redirectUrl.length+1 );
                                const data = IamportService.parseQuery(query);

                                resolve(new IamportCertification(data));
                                browser.close();
                            }
                        }
                    );

                browser.on("loadstop" )
                    .subscribe(
                        (e) => {
                            if ( !certificationProgress && (e.url).indexOf(certificationUrl) > -1 ) {
                                certificationProgress = true;

                                const inlineCallback = `(rsp) => {
                                                        if( rsp.success ) {
                                                            location.href = '${redirectUrl}?imp_success=true&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid;
                                                        } else {
                                                            location.href = '${redirectUrl}?imp_success=false&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid;
                                                        }
                                                   }`;
                                const iamport_script = `IMP.certification(${JSON.stringify(param)}, ${inlineCallback})`;

                                browser.executeScript({
                                    code : iamport_script
                                });
                            }
                        }, (e) => {

                        }
                    );

                browser.on("exit" )
                    .subscribe(
                        (e) => {
                            reject("사용자가 본인인증을 취소하였습니다.");
                        }
                    );

                browser.show();
            });
        });

        return promise;
    }

}
