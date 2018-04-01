import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(private location: Location, private authService: AuthService) { }


  Fullname: String = "";
  Username: String = "";
  Password: String = "";
  ConfirmPassword: String = "";
  Email: String = "";
  Address: String = "";
  Birthdate: Date;
  Phone: [String] = [""];
  Student: Boolean=false;
  Teacher: Boolean=false;
  Parent: Boolean=false;
  Div1 = false;
  Div2 = false;
  Div3 = false;
 AllisWell: Boolean= true;
  ngOnInit() {
  }




  register(user: any): void {
    //checking that password and confirm password match and all required entries are there
    //this.checked();
    
    if (!(this.Password === this.ConfirmPassword)) {
      this.showDiv1();
      this.AllisWell=false;
    }


    if (this.Fullname == "" || this.Username == "" || this.Email == "" || this.Birthdate == null) {
      this.showDiv2();
      this.AllisWell=false;

    }

    if (this.Student ==true && this.Teacher == true && this.Parent == true) //can't be a student & a parent/teacher
     
    {
      this.showDiv3();
      this.AllisWell=false;

    }

//to be continued
if(this.AllisWell) {
      var self = this;
      self.authService.signUp(user).subscribe();
    }//end else
    
  }//end method

  showDiv1() {
    this.Div1 = true;
  }

  showDiv2() {
    this.Div2 = true;
  }

  showDiv3() {
    this.Div3 = true;
  }
  //this method redirects the user back to the last page he was on before signing up
  redirect() {
    this.location.back();
  }//end method

  /* checked() {
    
    var choices= document.getElementsByName("group1")
    var len= choices.length
    
     for(let i=0; i<len; i++)
     {
       if(choices[i].click)

       {
         if(choices[i].nodeValue=="Student")
          this.Student=true;
        
          if(choices[i].nodeValue=="Parent")
          this.Parent=true;
          if(choices[i].nodeValue=="Teacher")
          this.Teacher=true;
          
        }//end if
     }//end for

   }//end method
   */


}//end class
