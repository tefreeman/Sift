import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: 'sg-home-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: object;
  constructor() { }

  ngOnInit() {
  }

}
