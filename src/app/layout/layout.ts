import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { SessionTimeoutService } from '../core/services/session-timeout.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Topbar, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit, OnDestroy {
  sidebarOpen = false;

  constructor(public sessionTimeout: SessionTimeoutService) {}

  ngOnInit(): void { this.sessionTimeout.start(); }
  ngOnDestroy(): void { this.sessionTimeout.stop(); }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void  { this.sidebarOpen = false; }
}
