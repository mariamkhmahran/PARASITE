import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})


export class ProfileComponent implements OnInit {

//---------- FLAGS --------------------
//User Flags
  currIsOwner = false;
  currIsParent = false;
  currIsChild = false;
  currIsIndependent = false;

  visitedIsParent = false;
  visitedIsChild = false;
  VisitedIsIndependent = false;

//Tab Navigation Flags
  pInfo = true;
  children = false;
  plan = false;
  sched = false;

//------------------------------------

//---------- User Info ---------------
  Name: String = "Fulan el Fulany";
  Username: String;
  Age: Number;
  Email: String;
  Address: String;
  Phone: String;
  Birthday: Date;
//------------------------------------

  constructor(private _ProfileService: ProfileService) { }


  ngOnInit() {
      //Retrieve all current/visited user data and set all the variables
  }

  requestContributerValidation() {

  }

  openInfo(): void{
    this.pInfo = true;
    this.children = false;
    this.plan = false;
    this.sched = false;
    document.getElementById("personalinfobtn").className = "active";
    document.getElementById("schedbtn").className = "";
    document.getElementById("childbtn").className = "";
    document.getElementById("plansbtn").className = "";
  }
  openSched(): void{
    this.pInfo = false;
    this.children = false;
    this.plan = false;
    this.sched = true;
    document.getElementById("personalinfobtn").className = "";
    document.getElementById("schedbtn").className = "active";
    document.getElementById("childbtn").className = "";
    document.getElementById("plansbtn").className = "";
  }
  openPlans(): void{
    this.pInfo = false;
    this.children = false;
    this.plan = true;
    this.sched = false;
    document.getElementById("personalinfobtn").className = "";
    document.getElementById("schedbtn").className = "";
    document.getElementById("childbtn").className = "";
    document.getElementById("plansbtn").className = "active";
  }
  openChildren(): void{
    this.pInfo = false;
    this.children = true;
    this.plan = false;
    this.sched = false;
    document.getElementById("personalinfobtn").className = "";
    document.getElementById("schedbtn").className = "";
    document.getElementById("childbtn").className = "active";
    document.getElementById("plansbtn").className = "";
  }


}
