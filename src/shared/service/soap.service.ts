import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';
import * as xml2js from 'xml2js';
import * as soap from 'soap';

@Injectable()
export class SoapService {
  private readonly soapUrl =  process.env.SOAP_URL;

  public generateXml(data: any): string {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('soap:Envelope', { 'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/' })
      .ele('soap:Body')
      .ele('request');
    
    root.ele('mhe_mode_flg').txt('true');
    root.ele('async_flg').txt('false');
    root.ele('pick_list');
    root.ele('list-item');

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.ele(key).txt(value);
      }
    });

    return root.end({ prettyPrint: true });
  }

  private buildXml(data: any): string {
    const builder = new xml2js.Builder({ headless: true });
    return builder.buildObject(data);
  }

  async sendToSoapService(data: any): Promise<any> {
    const xml = this.buildXml(data);

    return new Promise((resolve, reject) => {
      soap.createClient(this.soapUrl, (err, client) => {
        if (err) {
          return reject(err);
        }

        client.MyOperation({ _xml: xml }, (soapErr, result) => {
          if (soapErr) {
            return reject(soapErr);
          }
          resolve(result);
        });
      });
    });
  }
}