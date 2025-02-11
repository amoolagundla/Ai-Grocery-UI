import { Routes } from '@angular/router'; 
import { AuthGuard } from '../guards/auth.guard';
import { LoginComponent } from '../login/login.component';
import { PurchaseHistoryComponent } from '../purchase-history/purchase-history.component';
import { RecieptsComponent } from '../reciepts/reciepts.component';
import { ListsComponent } from '../lists/lists.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'purchases',
    component: PurchaseHistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'receipts',
    component: RecieptsComponent,
    canActivate: [AuthGuard]
  },{
    path: 'lists',
    component: ListsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/purchases',
    pathMatch: 'full'
  }
];