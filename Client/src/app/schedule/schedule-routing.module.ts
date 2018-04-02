import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScheduleComponent } from './schedule/schedule.component';
import { StudyPlanComponent } from './study-plan/study-plan.component';
import { PublishedStudyPlansComponent } from './study-plan/published-study-plans/published-study-plans.component';
import { StudyPlanEditViewComponent } from './study-plan/study-plan-edit-view/study-plan-edit-view.component';
const routes = [
  { path: 'schedule/:id', component: ScheduleComponent },
  { path: 'study-plan/:type/:id', component: StudyPlanComponent },
  { path: 'published-study-plans', component: PublishedStudyPlansComponent },
  { path: 'study-plan-edit/:type', component: StudyPlanEditViewComponent }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ScheduleRoutingModule { }
