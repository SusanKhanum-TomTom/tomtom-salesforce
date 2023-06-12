import { LightningElement, api, track } from 'lwc';
import retriveSearchData from '@salesforce/apex/PostRichChatter.searchUsers';
import {refreshApex} from '@salesforce/apex';

export default class ReusableMultiselectLookup extends LightningElement {
    @api objectname;
    @api fieldnames;
    @api label;
    @api isposted;
    @track searchRecords = [];
    @track selectedRecords = [];
    @api iconName = 'standard:user'
    @track messageFlag = false;
    @track isSearchLoading = false;
    @api placeholder;
    @track searchKey;
    delayTimeout;
    @api refreshData=false;

    searchField() {
        var selectedRecordIds = [];

        this.selectedRecords.forEach(ele=>{
            selectedRecordIds.push(ele.Id);
        })

         //retriveSearchData({ ObjectName: this.objectname, fieldName: this.fieldnames, value: this.searchKey, selectedRecId: selectedRecordIds })
         retriveSearchData({query:this.searchKey,selectedRecId:selectedRecordIds})
            .then(result => {
                this.searchRecords = result;
                this.isSearchLoading = false;
                const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
                const clsList = lookupInputContainer.classList;
                clsList.add('slds-is-open');

                if (this.searchKey.length > 0 && result.length == 0) {
                    this.messageFlag = true;
                } else {
                    this.messageFlag = false;
                }
            }).catch(error => {
                console.log(error);
            });
    } 

    // update searchKey property on input field change  
    handleKeyChange(event) {
        // Do not update the reactive property as long as this function is
        this.isSearchLoading = true;
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.searchKey = searchKey;
            this.searchField();
        }, 300);
    }

    // method to toggle lookup result section on UI 
    toggleResult(event) {
        const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
        const clsList = lookupInputContainer.classList;
        const whichEvent = event.target.getAttribute('data-source');

        switch (whichEvent) {
            case 'searchInputField':
                clsList.add('slds-is-open');
                this.searchField();
                break;
            case 'lookupContainer':
                clsList.remove('slds-is-open');
                break;
        }
    }
    @api handleAfterPost(){
        this.selectedRecords = [];
    }

    setSelectedRecord(event) {
        
            const recId = event.target.dataset.id;
            let newsObject = this.searchRecords.find(data => data.Id === recId);
            console.log('new sobject',newsObject);
            console.log('this.selectedREcords: ',JSON.stringify(this.selectedRecords));
            this.selectedRecords.push(newsObject);  
            this.template.querySelector('.lookupInputContainer').classList.remove('slds-is-open');
            this.template.querySelectorAll('lightning-input').forEach(each => {
                each.value = '';
            });
            let newArray = [];
            newArray.push(newsObject);
            let selRecords = this.selectedRecords;
            
           // if (!this.selectedRecords.some(record => 
              //  record.Id === newsObject.Id)) {
           
           // }
          /* 
          this.selectedRecords.map(rec => console.log('rec',rec));
           if(this.selectedRecords.lenght>1){
               console.log('length is greater than 1')
            this.selectedRecords = this.selectedRecords.filter(record => record.Id !== recId);
           }
           
            console.log('sel recrods',JSON.stringify(this.selectedRecords));
            this.template.querySelector('.lookupInputContainer').classList.remove('slds-is-open');
            let selRecords = this.selectedRecords;
            console.log('selrecords  herre ',JSON.stringify(selRecords));
            this.template.querySelectorAll('lightning-input').forEach(each => {
                each.value = '';
            });
            
            console.log('selected recs from child comp',JSON.stringify(selRecords));
            
             */
            console.log('newsobject',JSON.stringify(newsObject));
            console.log('newArray',JSON.stringify(newArray));
            console.log('selrecords',JSON.stringify(selRecords));
            console.log('data from child comp', selRecords);
            const selectedevent = new CustomEvent('selected', { detail: { newArray }, });
            // Dispatches the event.
            this.dispatchEvent(selectedevent);
                }

    removeRecord(event) {
        let selectRecId = [];
        console.log('selected records right now',JSON.stringify(this.selectedRecords));

        this.selectedRecords = this.selectedRecords.filter(
            obj=> obj.Id != event.detail.name
            );
        console.log('this.selected records now',this.selectedRecords);
       /*  for (let i = 0; i < this.selectedRecords.length; i++) {
            console.log('event.detail.name--------->' + event.detail.name);
            console.log('this.selectedRecords[i].Id--------->' + this.selectedRecords[i].Id);
             if (event.detail.name !== this.selectedRecords[i].Id)
                selectRecId.push(this.selectedRecords[i]); */
                let selRecords = this.selectedRecords;
                console.log('selrecords removing herre ',JSON.stringify(selRecords));
                const selectedevent = new CustomEvent('deselected', { detail: { selRecords }, });
                this.dispatchEvent(selectedevent)
        }
        
       /*  this.selectedRecords = [...selectRecId];
        console.log('this.selectedRecords----------->' + this.selectedRecords);
        let selRecords = this.selectedRecords;
        console.log('removed users',selRecords) */
       // const selectedevent = new CustomEvent('deselected', { detail: { selRecords }, });
        // Dispatches the event.
        //this.dispatchEvent(selectedevent); */
    //}
}