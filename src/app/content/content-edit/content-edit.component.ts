import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ENTER, COMMA, SPACE, BACKSPACE } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';
import { NgForm } from '@angular/forms';
import { ContentService } from '../content.service';
import { Content } from '../content';
import { Section } from '../../../interfaces/section';
import { Router, ActivatedRoute } from '@angular/router';
import { Category } from '../../../interfaces/category';
import { AuthService } from '../../auth/auth.service';
import { CloudinaryOptions, CloudinaryUploader } from 'ng2-cloudinary';
import { CloudinaryCredentials } from '../../variables';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
declare const $: any;
@Component({
  selector: 'app-content-edit',
  templateUrl: './content-edit.component.html',
  styleUrls: ['./content-edit.component.scss']
})
export class ContentEditComponent implements OnInit {
  private editor;
  private isUpdate = false;
  public videoInput: string;
  public categories: Category[];
  public requiredSections: Section[];
  public loading: any = false;
  public chipInput: any = '';
  private toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote'],
    [{ 'header': '1' }, { 'header': '2' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'direction': 'rtl' }],
  ];
  private editorOptions: Object = {
    placeholder: 'insert content here',
    modules: {
      toolbar: this.toolbarOptions
    }
  };

  separatorKeysCodes = [ENTER, COMMA, SPACE, BACKSPACE];
  public content: Content = {
    body: '',
    category: '',
    discussion: [],
    section: '',
    image: '',
    tags: [],
    title: '',
    touchDate: new Date(),
    type: 'resource',
    language: 'english'
  };
  uploader: CloudinaryUploader = new CloudinaryUploader(
    new CloudinaryOptions({ cloudName: CloudinaryCredentials.cloudName, uploadPreset: CloudinaryCredentials.uploadPreset })
  );
  constructor(private sanitizer: DomSanitizer,
    private contentService: ContentService,
    private authService: AuthService,
    private toasterService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService) {
    const self = this;
    this.authService.getUserData(['username']).subscribe(function (res) {
      if (Array.isArray(res)) {
        self.authService.setToken(null);
        self.toasterService.error('Please sign in first', 'failure');
        self.router.navigateByUrl('/auth/sign-in');
        return;
      }
    });
  }

  // Handle tag input on content edit
  onTagInput(event: KeyboardEvent): void {
    // IF the recorded key event is not a target one, ignore the event
    if (!this.separatorKeysCodes.includes(event.keyCode)) {
      return;
    }

    // Remove a tag on backspace
    if (event.keyCode === BACKSPACE) {
      if (this.chipInput) {
        return;
      }
      this.content.tags.splice(-1, 1);
      return;
    }

    // Add tag
    if ((this.chipInput || '').trim()) {
      this.content.tags.push(this.chipInput.trim());
    }

    // Reset the input value
    if (this.chipInput) {
      this.chipInput = '';
    }
  }

  // on content edit form submit
  onSubmit(): void {
    const self = this;
    if (this.authService.getToken() === '') {
      // TODO: (Universal Error Handler/ Modal Errors)
      console.log('Please sign in first');
      return;
    }
    // get username of the registered user
    this.authService.getUserData(['username']).subscribe(function (authRes) {
      if (self.isUpdate) {
        self.updateContent();
      } else {
        self.createContent();
      }
    });
  }
  // create content
  createContent(): void {
    const self = this;
    console.log(self.content);
    self.contentService.createContent(self.content).subscribe(function (contentRes) {
      if (!contentRes) {
        return;
      }
      if (contentRes.data.content) {
        self.router.navigateByUrl('/content/view/' + contentRes.data.content._id);
        return;
      }
      self.router.navigateByUrl('/content/view/' + contentRes.data._id);
    });
  }

  // update content
  updateContent(): void {
    const self = this;
    self.contentService.updateContent(self.content).subscribe(function (contentRes) {
      if (!contentRes || !contentRes.data) {
        return;
      }
      if (contentRes.data.content) {
        self.router.navigateByUrl('/content/view/' + contentRes.data.content._id);
      }
      self.router.navigateByUrl('/content/view/' + contentRes.data._id);
    });
  }
  // retrieve all categories from server
  getCategories(): void {
    const self = this;
    this.contentService.getCategories().subscribe(function (res) {
      if (!res || !res.data) {
        return [];
      }
      self.categories = res.data;
    });
  }

  // transfer video link input to security bypass URL
  getSafeUrl() {
    this.content.video = this.videoInput;
  }

  getSections() {
    const self = this;
    const matchCategoryName = function (category) {
      return category.name === self.content.category;
    };
    const selectedCategory: Category = this.categories.filter(matchCategoryName)[0];

    this.requiredSections = selectedCategory.sections;
  }


  initUpdateView(contentID) {
    const self = this;
    self.contentService.getCategories().subscribe(function (res) {
      if (!res || !res.data) {
        return [];
      }
      self.categories = res.data;
      self.contentService.getContentById(contentID).subscribe(function (contentResponse) {
        if (!contentResponse) {
          console.log('couldn\'t find the content');
          return;
        }
        self.isUpdate = true;
        self.content = contentResponse.data;
        self.getSections();
      });
    });

  }

  uploadImage() {
    let self = this;
    if (this.uploader.queue.length > 0) {
      this.loading = true;
      this.uploader.uploadAll();
      this.uploader.onSuccessItem = (
        item: any,
        response: string,
        status: number,
        headers: any): any => {
        let res: any = JSON.parse(response);
        this.loading = false;
        self.content.image = res.url;
      };
      this.uploader.onErrorItem =
        function (fileItem, response, status, headers) {
          // console.info('onErrorItem', fileItem, response, status, headers);
          self.toasterService.error('failed to upload image, please try again', 'failure');
        };
    } else {
      self.toasterService.error('No file supplied to upload', 'failure');
    }
  }


  ngOnInit() {
    const self = this;
    const contentID = self.route.snapshot.params.id;
    if (contentID) {
      self.isUpdate = true;
      self.initUpdateView(contentID);
    }
    self.getCategories();
  }
}
