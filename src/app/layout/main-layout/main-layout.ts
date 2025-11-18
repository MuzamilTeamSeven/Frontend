import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-main-layout',
  imports: [RouterModule, RouterOutlet],
  standalone: true,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent  {

}
