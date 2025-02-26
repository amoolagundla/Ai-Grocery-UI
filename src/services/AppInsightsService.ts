 

import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ActivatedRouteSnapshot, ResolveEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators'; 
import { environment } from '../assets/environment';

@Injectable({
  providedIn: 'root'
})
export class AppInsightsService {
  private appInsights: ApplicationInsights;
  
  constructor(private router: Router) {
    this.appInsights = new ApplicationInsights({
      config: {
        connectionString: environment.appInsightsConnectionString,
        enableAutoRouteTracking: true, // Enables tracking page views automatically
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
      }
    });
  }

  // Initialize the Application Insights SDK
  init() {
    if (!this.appInsights) {
      return;
    }

    this.appInsights.loadAppInsights();
    this.appInsights.trackPageView(); // Track initial page view

    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof ResolveEnd)
    ).subscribe((event: ResolveEnd) => {
      const activatedComponent = this.getActivatedComponent(event.state.root);
      if (activatedComponent) {
        this.logPageView(`${activatedComponent.name} ${this.getRouteTemplate(event.state.root)}`, event.urlAfterRedirects);
      }
    });
  }

  // Track page views
  logPageView(name?: string, url?: string) {
    this.appInsights.trackPageView({
      name: name,
      uri: url
    });
  }

  // Track exception events
  logException(exception: Error, severityLevel?: number) {
    this.appInsights.trackException({ exception, severityLevel });
  }

  // Track trace events (general logs)
  logTrace(message: string, properties?: { [key: string]: any }) {
    this.appInsights.trackTrace({ message, properties });
  }

  // Track custom events
  logEvent(name: string, properties?: { [key: string]: any }) {
    this.appInsights.trackEvent({ name, properties });
  }

  // Track metrics
  logMetric(name: string, average: number, properties?: { [key: string]: any }) {
    this.appInsights.trackMetric({ name, average, properties });
  }

  // Helper method to get the activated component
  private getActivatedComponent(snapshot: ActivatedRouteSnapshot): any {
    if (snapshot.firstChild) {
      return this.getActivatedComponent(snapshot.firstChild);
    }
    return snapshot.component;
  }

  // Helper method to get the route template
  private getRouteTemplate(snapshot: ActivatedRouteSnapshot): string {
    let path = '';
    if (snapshot.routeConfig) {
      path += snapshot.routeConfig.path;
    }
    if (snapshot.firstChild) {
      return path + this.getRouteTemplate(snapshot.firstChild);
    }
    return path;
  }
}