import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Coin,
  Exchange,
  GlobalData,
  MarketChart,
  Period,
  TrendingResponse,
} from '../models';

/** Talks to the Spring Boot backend (which proxies CoinGecko). The browser
 *  never calls CoinGecko directly. */
@Injectable({ providedIn: 'root' })
export class CryptoApi {
  private readonly http = inject(HttpClient);

  markets(): Observable<Coin[]> {
    return this.http.get<Coin[]>('/api/markets');
  }

  global(): Observable<GlobalData> {
    return this.http.get<GlobalData>('/api/global');
  }

  trending(): Observable<TrendingResponse> {
    return this.http.get<TrendingResponse>('/api/trending');
  }

  exchanges(): Observable<Exchange[]> {
    return this.http.get<Exchange[]>('/api/exchanges');
  }

  chart(id: string, period: Period): Observable<MarketChart> {
    return this.http.get<MarketChart>(`/api/chart/${id}`, { params: { period } });
  }
}
