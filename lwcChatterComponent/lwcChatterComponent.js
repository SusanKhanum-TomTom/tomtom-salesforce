import { LightningElement, wire,track,api } from 'lwc';
import chatterComponentController from '@salesforce/apex/PostRichChatter.post';
import LightningAlert from 'lightning/alert';
import searchUsers from '@salesforce/apex/PostRichChatter.searchUsers';
import { refreshApex } from '@salesforce/apex';
import getChatterFeedItems from '@salesforce/apex/ChatterFeedController.getChatterFeedItems';
import editPost from '@salesforce/apex/PostRichChatter.editPost';
import deleteRecord from '@salesforce/apex/PostRichChatter.deletePost';
import userId from '@salesforce/user/Id';    


export default class ChatterMentionComponent extends LightningElement {

    messageContext;
    mentionsList = [];
    userOptions = [];
    optionsLoaded = false;
    feedItems;
    isPosted = false;
    feedItemList;
    @api recordId;
    postContent = '';
    editPostContent = '';
    editedPostContent = '';
    arrayLength;
    refreshData=false;
    editPost = false;
    feedItemId = '';
    myRec = false;
    userId = userId;

    selectedUserId = [];
    @track userSearchKeyword = '';
    @track users = [];

    handleEditPostContentChange(event){
        this.editedPostContent = event.detail.value;
        console.log('content',this.editedPostContent);
    }

    handleEditPost(event){
        this.feedItemId = event.target.dataset.recordId;
        let index = event.currentTarget.dataset.index;
        let recs =  JSON.parse( JSON.stringify( this.feedItems ) );
        let content = recs[index].Body;
        this.editPostContent = content;
        this.editPost = !this.editPost;
    }
    handleDeletePost(event){
        this.feedItemId = event.target.dataset.recordId;
        //let index = event.currentTarget.dataset.index;
        deleteRecord({ recordId: this.feedItemId })
        .then(()=>{
            LightningAlert.open({
                message: 'Deleted Successfully!',
                theme: 'success', 
                label: 'Success!',
            });
            refreshApex(this.feedItemList);
        })
    }
    getExistingFeedItemId(){
        console.log('feeditemid from getexisitingfeeditemid method',this.feedItemId);
        return this.feedItemId;
        
    }

    @wire(searchUsers, { query: '$userSearchKeyword' })
    wiredUsers(result) {
        if (result.data) {
            this.users = result.data;
            console.log('result.data--> ',result.data);

            for(let key in result.data){
                this.userOptions.push({label:result.data[key].Name,value:result.data[key].Id})
            }
           this.optionsLoaded = true;
           
        } else if (result.error) {
            console.log(result.error);
        }
    }
    @wire(getChatterFeedItems,{recordId: '$recordId'})
    wiredFeedItems(result){
        this.feedItemList = result;
        
        if (result.data) {
           // this.feedItems = this.feedItemList.data;
            this.feedItems = this.feedItemList.data.map(item=>({
              //  console.log('mapping through itemsL ',item);
              ...item,
                isOwnedByMe: item.CreatedById === this.userId
                //item.isOwnedByMe = item.CreatedById == this.userId;
               // return { ...item,isOwnedByMe };
            })); 
        /*  this.myRec =  this.feedItems.map(record=>{
            record.CreatedById == this.userId;

           })
           console.log('my record:',this.myRec); */

            this.arrayLength = this.feedItems.length;
            console.log('array lenght',this.arrayLength);
            console.log('feed items ',this.feedItems);
        } else if (result.error) {
            // Handle error
        }
    }
    /* getFeedItemsWithOwnership() {
        return this.feedItems.map(feedItem => ({
            ...feedItem,
            isCurrentUserOwner: feedItem.CreatedById === this.currentUserId
        }));
    } */
/* 
    handleChangeUserSearchKeyword(event) {
        window.clearTimeout(this.delayTimeout);
        const keyword = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.userSearchKeyword = keyword;
        }, 300);
    }

    @track newRecipients = [];
    @track isOverfilled = false;

    get hasNewRecipients() {
        return this.newRecipients.length > 0;
    }

    addNewRecipients(event) {
        if (this.newRecipients.length >= 9) {
            this.isOverfilled = true;
            return;
        }
        //Do nothing if the selected user is already in new recipient list
        if (this.newRecipients.some((u) => u.id === event.target.dataset.id)) {
            return;
        }
        //Add user to new recipient list
        this.newRecipients.push(this.users.find((u) => u.id === event.target.dataset.id));
    }

    removeFromNewRecipients(event) {
        this.newRecipients = this.newRecipients.filter((u) => {
            return u.id !== event.target.dataset.id;
        });
        if (this.newRecipients.length < 9) {
            this.isOverfilled = false;
        }
    } */
    handlePostContentChange(event) {
        this.postContent = event.target.value;
        console.log('postcontent1',this.postContent);
    }
    handleCancel(){
        this.editPost = !this.editPost;
    }

    handleUserSelection1(event) {
        const data = event.detail.newArray;
        
        console.log('data in parent comp',JSON.stringify(data));
         if(data && data.length>1){
            const uniqueIds = {};
            console.log('length is greater than 1')
            const filteredData = data.filter(record => {
                if (!uniqueIds[record.Id]) {
                  uniqueIds[record.Id] = true;
                  return true;
                }
                return false;
              });
            console.log('filtered data',JSON.stringify(filteredData));
            /* for(var key in filteredData){

                this.selectedUserId.push('{'+data[key].Id+'}');
            } */
            filteredData.forEach(record => {
                this.selectedUserId.push('{' + record.Id + '}');
              });
        } else if(data && data.length == 1){
             /*   for(var key in data){

            this.selectedUserId.push('{'+data[key].Id+'}');
        }  */
        data.forEach(record => {
            this.selectedUserId.push('{' + record.Id + '}');
          });
        }
      
       // console.log('final data',JSON.stringify(finalData));
        
        
        //this.selectedUserId.push(data)
        console.log('selected user id ',JSON.stringify(this.selectedUserId));
    }
    handleUserSelection(event) {
        let data = [];
        data.push(event.detail.newsObject);
      
       /*  console.log('data in parent comp', JSON.stringify(data));
        if(data.length>1){
            const uniqueIdsSet = new Set();
        const filteredData = data.filter(record => {
          if (!uniqueIdsSet.has(record.Id)) {
            uniqueIdsSet.add(record.Id);
            return true;
          } 
          return false;
        });
       */
        console.log('filtered data length', data.length);   

      if(data.length > 0){
          console.log('data is ',JSON.stringify(data));
          for(var key in data){

            this.selectedUserId.push('{'+data[key].Id+'}');
      }
       
      

        
        
        console.log('selected user id ', JSON.stringify(this.selectedUserId));
      }
    }
    navigateToUserSearchForm() {
        this.optionsLoaded = true;
        console.log(this.showsUserSearchForm);
    }

    handleRemoveUser(event){
        console.log('Event is this::::::',event);
        this.selectedUserId = [];
        const data = event.detail.selRecords;
        if(data && data.length > 0 && data[0].Id){
            console.log('data in parent comp remove',JSON.stringify(data));
        let strRemovedId = '';
        strRemovedId = '{'+data[0].Id+'}';
        console.log('removalbe string: ',strRemovedId);
        this.selectedUserId.push(strRemovedId);
        console.log('selected user ids now ',JSON.stringify(this.selectedUserId));
        }
        
        
         /* for(var key in data){
            this.selectedUserId.push('{'+data[key].Id+'}');
        }  */
        //this.selectedUserId.push(data)
        
        refreshApex(this.feedItemList);
    }

    handlePostButtonClick(event) {
        let mentionIds = [];
        mentionIds.push(this.selectedUserId);
        console.log('mention ids ',mentionIds);
        
        if(mentionIds != null){
            this.postContent = this.postContent;
            if(mentionIds.length >= 1){
                this.postContent = this.postContent+'\n'+mentionIds;
            }
          
            console.log('postcontent ',this.postContent);
        }


        if (!mentionIds || !this.postContent) {
            console.log('mention id or post id not there');
  
        }
        let existingFeedItemId = this.getExistingFeedItemId();
        if (existingFeedItemId) {
            editPost({strbody:this.editedPostContent,feedElementId:this.feedItemId,strcommunityId:null})
            this.editPost = !this.editPost;
            LightningAlert.open({
                message: 'Edited Successfully!',
                theme: 'success', 
                label: 'Success!',
            });
            setTimeout(()=>{
                refreshApex(this.feedItemList);
            },1000)
          } else {

        chatterComponentController({strbody:this.postContent,strtargetNameOrId:this.recordId,strcommunityId:null})
        .then((result)=>{
            console.log('result',JSON.stringify(result));
            LightningAlert.open({
                message: 'Posted Successfully!',
                theme: 'success', 
                label: 'Success!',
            });
            this.isPosted = true;
            this.refreshData=true;
            this.template.querySelector('c-reusable-multiselect-lookup').isposted = this.isPosted;
            this.template.querySelector('c-reusable-multiselect-lookup').handleAfterPost();
            refreshApex(this.feedItemList);
        
        })
        .catch((error)=>{
            console.log('error',JSON.stringify(error));
        })
    }
        // Clear the post content and user selection
        this.postContent = '';
        this.selectedUserId = [];
        
       
    }

}