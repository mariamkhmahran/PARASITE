import { Component, OnInit } from '@angular/core';

import { ActivityService } from '../activity.service';
import { Activity } from '../activity';
import { apiUrl } from '../../variables';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {
  /*
  @author: Wessam
  */
  activities: Activity[];
  numberOfElements: Number;
  pageSize: Number;
  pageIndex: Number;
  canCreate: Boolean;
  private createUrl = "/create-activity";

  constructor(private activityService: ActivityService) { }

  ngOnInit() {
    this.getActivities(null);
  }

  getActivities(event) {
    /*
      Getting the activities from the api

      @var event: An object that gets fired by mat-paginator
    */
    let page = 1;
    if (event) {
      page = event.pageIndex + 1;
    }
    this.activityService.getActivities(page).subscribe(
      res => this.updateLayout(res)
    )
  }


  updateLayout(res) {
    /*
      Setting new values comming from 
      the response
    */
    document.querySelector(".mat-sidenav-content").scrollTop = 0;
    this.activities = res.data.docs;
    this.numberOfElements = res.data.total;
    this.pageSize = res.data.limit;
    this.pageIndex = res.data.pageIndex;
    this.canCreate = true;
    for (let activity of this.activities) {
      if (!activity.image) {
        activity.image = "assets/images/activity-view/default-activity-image.jpg";
      }
    }
  }

}
