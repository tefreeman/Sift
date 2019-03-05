import { Component, OnInit } from '@angular/core';
import { UnifiedStorageService } from "../../../core/services/storage/unified-storage.service";
import { log } from "../../../core/logger.service";
import { CacheService } from "../../../core/services/cache/cache.service";
import { CollectionDataService } from "../../../core/services/data/sync-collection/collection-data.service";

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
