import { Component, OnInit } from '@angular/core';
import { UnifiedStorageService } from "../../../core/services/test/unified-storage.service";
import { log } from "../../../core/logger.service";
import { CacheService } from "../../../core/services/test/cache.service";

interface ITest {
  name: string;
  age: number;
}
@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  providers: [UnifiedStorageService]
})
export class HealthPage implements OnInit {

  constructor(private cacheService: CacheService) { }

  ngOnInit() {
  }
test() {

}

}
