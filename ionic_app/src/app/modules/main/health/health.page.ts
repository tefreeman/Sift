import { Component, OnInit } from '@angular/core';
import { UnifiedStorageService } from "../../../core/services/test/unified-storage.service";
import { log } from "../../../core/logger.service";
import { CacheService } from "../../../core/services/test/cache.service";
import { CollectionDataService } from "../../../core/services/test/collection-data.service";

interface ITest {
  name: string;
  age: number;
}
@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  providers: [CollectionDataService]
})
export class HealthPage implements OnInit {

  constructor(private collectionDataService: CollectionDataService) {
   // this.collectionDataService.('filters');
  }

  ngOnInit() {
  }
test() {

}

}
