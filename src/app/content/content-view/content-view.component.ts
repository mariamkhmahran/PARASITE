import { Component, OnInit } from '@angular/core';
import { Content } from '../content';
import { ContentService } from '../content.service';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../admin.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../auth/user';
import { DiscussionService } from '../../discussion.service';
import { VideoIdExtractorPipe } from '../video-id-extractor.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.scss']
})
export class ContentViewComponent implements OnInit {
  // the content that the user is viewing
  content: Content;
  recommendedContent: Content[];

  // the signed-in user if he/she exists
  currentUser: User;

  // comments
  comments: any;
  viewedReplies: boolean[] = [];
  changingComment: String = '';
  somePlaceholder: String = 'Leave a comment';
  showReplies: String = 'Show replies';
  hideReplies: String = 'Hide replies';
  isReplying: boolean;
  commentReplyingOn: any;
  public YT: any;
  public videoId: any;
  public player: any;

  // inject the needed services
  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private videoIdExtractorPipe: VideoIdExtractorPipe,
    private adminService: AdminService,
    private authService: AuthService,
    private discussionService: DiscussionService,
    private toasterService: ToastrService,
    private router: Router
  ) { }


  ngOnInit() {
    window.scrollTo(0, 0);
    const self = this;
    // retrieve the user data
    this.authService.getUserData(['username', 'isAdmin']).
      subscribe(function (user) {
        self.currentUser = user.data;
      });
    // retrieve the id of the content from the current path and request content
    this.route.params.subscribe(function (params) {
      self.getContentById(params.id);
    });
  }
  // retrieve the content from the server
  getContentById(id: any): void {
    const self = this;
    this.contentService.getContentById(id).subscribe(function (retrievedContent) {
      self.content = retrievedContent.data;
      console.log('here');
      self.comments = retrievedContent.data.discussion;
      if (self.content) {
        self.getRecommendedContent();
        if (self.content.video) {
          self.initYoutubeAPI();
          self.initContentVideo();
        }
      }
    });
  }

  // admin is done with reviewing the content, send him back to his page
  returnToContentRequests(): void {
    this.router.navigate(['admin']);
  }

  // delete Content function
  deleteContentById(id: any): void {
    const self = this;
    this.contentService.deleteContentById(id).subscribe(function (retrievedContent) {
      self.router.navigate(['/content-list-view']);
    });
  }

  addComment(inputtext: String) {
    let self = this;
    function isEmpty(str) {
      return (!str || 0 === str.length || !str.trim());
    }
    if (!isEmpty(inputtext)) {
      if (this.isReplying) {
        console.log('replying');
        this.discussionService.postReplyOnCommentOnContent(
          this.content._id,
          this.commentReplyingOn,
          self.changingComment).subscribe(function (err) {
            if (err.msg !== 'reply created successfully') {
              console.log('err in posting');
              self.refreshComments(false);
            }
            console.log('no error elhamdulla ');
            self.refreshComments(false);
            self.changingComment = '';
            let input = document.getElementById('input');
            self.somePlaceholder = 'leave a comment';
            self.isReplying = false;

          });
      } else {
        console.log('commenting');
        this.discussionService.postCommentOnContent(this.content._id, self.changingComment).subscribe(function (err) {
          if (err.msg === 'reply created successfully') {
            console.log('err in posting');
          }
          self.refreshComments(false);
          self.changingComment = '';
        });
      }
    }
  }
  onReply(id: any): any {
    let self = this;
    let element = document.getElementById('target');
    element.scrollIntoView();
    let input = document.getElementById('inputArea');
    self.somePlaceholder = 'leave a reply';
    input.focus();
    this.isReplying = true;
    this.commentReplyingOn = id;
  }
  onDelete(i: any) {
    let self = this;
    this.discussionService.deleteCommentOnContent(this.content._id, i).subscribe(function (err) {
      if (err) {
        console.log(err);
      }
      self.refreshComments(false);
    });
  }
  onDeleteReply(commentId: any, replyId: any) {
    let self = this;
    this.discussionService.deleteReplyOnCommentOnContent(this.content._id, commentId, replyId).subscribe(function (err) {
      if (err) {
        console.log(err);
      }
      self.refreshComments(false);
    });
  }
  refreshComments(refreshViewReplies: boolean): any {
    let self = this;
    this.contentService.getContentById(this.content._id).subscribe(function (retrievedContent) {
      self.comments = retrievedContent.data.discussion;
      if (refreshViewReplies) {
        self.viewedReplies = [];
        for (let i = 0; i < this.content.discussion.length; i++) {
          this.viewedReplies.push(false);
        }
      }
    });
  }
  cancel() {
    this.changingComment = '';
    this.isReplying = false;
    let input = document.getElementById('inputArea');
    this.somePlaceholder = 'leave a comment';
    input.blur();

  }
  showReply(i: number) {
    this.viewedReplies[i] = !this.viewedReplies[i];
  }

  // admin or owner user of content wishes to edit the content
  redirectToContentEdit(): void {
    this.router.navigateByUrl('/content-edit/' + this.content._id);
  }

  // retrieve the recommended content related to the content the user is viewing
  getRecommendedContent(): void {
    const self = this;
    // remove unnecessary spaces
    let searchQuery =
      this.content.title + ' ' +
      this.content.category + ' ' +
      this.content.section + ' ' +
      this.content.tags.join(' ');

    // retrieve search page from the server
    this.contentService.getSearchPage(
      1,
      8,
      searchQuery,
      '',
      '',
      'relevance',
      this.content.language
    ).subscribe(function (res) {
      // update the recommended content array
      self.recommendedContent = res.data.contents.docs.slice(1);
    });

  }

  initYoutubeAPI() {
    const apiScriptTag = document.createElement('script');
    apiScriptTag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(apiScriptTag, firstScriptTag);
  }

  initContentVideo() {
    const self = this;
    this.videoId = this.videoIdExtractorPipe.transform(this.content.video);
    window['onYouTubeIframeAPIReady'] = function (event) {
      self.YT = window['YT'];
      self.player = new window['YT'].Player('player', {
        videoId: self.videoId,
        events: {
          'onStateChange': self.onPlayerStateChange.bind(self)
        }
      });
    };
  }

  onPlayerStateChange(event) {
    const self = this;
    if (event.data === window['YT'].PlayerState.ENDED) {
      this.contentService.addLearningScore(self.content._id).subscribe(function (res) {
        if (!res) {
          return;
        }
        self.toasterService.success(res.msg, 'success');
        console.log(self.toasterService.previousToastMessage);
      });
    }
  }


}