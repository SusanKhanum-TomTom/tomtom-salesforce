global with sharing class PostRichChatter {
    private static List<String> PROFILE_NAME=new List<String>{'Partner Community User Custom','Partner Community Manager Custom','Partner Community User','System Administrator','Global Sales Operations','IT Support'};
        
        
        @AuraEnabled
        global static List<Results> post(String strbody,String strtargetNameOrId,String strcommunityId) {
            System.debug('entering PostRichChatter');
            String body = strbody;
            String targetNameOrId = strtargetNameOrId;
            String communityId = strcommunityId;
            if (communityId == null)
                communityId = Network.getNetworkId();
            
            //check to see if the targetNameOrId matches a Group Name or a Username
            List<Group> targetGroup = [SELECT Id FROM Group WHERE Name =:targetNameOrId];
            System.debug('targetGroup is: ' + targetGroup);
            if (targetGroup.size() == 1) {
                
                targetNameOrId = targetGroup[0].Id;
            } else {
                System.debug('targetNameOrId is: ' + targetNameOrId );
                List<User> targetUser = [SELECT Id FROM User WHERE username =:targetNameOrId];
                System.debug('targetUser is: ' + targetUser);
                if (targetUser.size() == 1){
                    targetNameOrId = targetUser[0].Id;
                }
            }
            
            //several things that Flow rich text supports, like color and font size, are represented by span tags. chatter doesn't support, so need to strip them out
            Pattern MyPattern = Pattern.compile('<\\/?span[^>]*>');
            Matcher MyMatcher = MyPattern.matcher(body);
            body = MyMatcher.replaceAll('');
            //craft a replacement string
            
            String anchorPattern = '(<a href="([^"]+)" target="_blank">([^<]+)<\\/a>)';
            MyPattern = Pattern.compile(anchorPattern);
            MyMatcher = MyPattern.matcher(body);
            body = MyMatcher.replaceAll('$3 ($2) ');
            System.debug ('body after replacement is: ' + body);
            
            //also have to strip out indent markup:
            //Here's some indented stuff:</p><p class="ql-indent-2">I'm indented</p><p>
            String indentedClassPattern = ' class="ql-indent-[1-4]"';
            MyPattern = Pattern.compile(indentedClassPattern);
            MyMatcher = MyPattern.matcher(body);
            body = MyMatcher.replaceAll('');
            System.debug ('body after replacement is: ' + body);
            
            //change <br> to <p></p>:
            String brPattern = '<br>';
            MyPattern = Pattern.compile(brPattern);
            MyMatcher = MyPattern.matcher(body);
            body = MyMatcher.replaceAll('<p></p>');
            System.debug ('body after replacement is: ' + body);
            
            //change <strong> to <b> and </strong> to </b>:
            String strongPattern = 'strong>';
            MyPattern = Pattern.compile(strongPattern);
            MyMatcher = MyPattern.matcher(body);
            body = MyMatcher.replaceAll('b>');
            System.debug ('body after replacement is: ' + body);
            
            //image links work fine, but we'll do a little reformatting to remove the html 
            String imagePattern = '<img src="([^"]+)">';
            MyPattern = Pattern.compile(imagePattern);
            MyMatcher = MyPattern.matcher(body);
            body = MyMatcher.replaceAll('image: $1');
            System.debug ('body after replacement is: ' + body);
            
            //ConnectApi.FeedItem fi = (ConnectApi.FeedItem) ConnectApiHelper.postFeedItemWithMentions(Network.getNetworkId(), 'me', 'Hey there {005D00000015tjz}, how are you?');
            ConnectApi.FeedItem feedItem = (ConnectApi.FeedItem) ConnectApiHelper.postFeedItemWithRichText(communityId, targetNameOrId, body);
            
            
            
            
            //Create a Results object to hold the return values
            
            Results response = new Results();
            
            //add the return values to the Results object
            response.feedItemId = feedItem.id;
            
            //Wrap the Results object in a List container (an extra step added to allow this interface to also support bulkification)
            List<Results> responseWrapper= new List<Results>();
            responseWrapper.add(response);
            return responseWrapper;
            
        }
    
    global class Requests {
        @AuraEnabled
        public String body;
        
        @AuraEnabled
        public String targetNameOrId;
        
        // @InvocableVariable(required=false)
        // public String targetType;
        
        @AuraEnabled
        public String communityId;
        
        
    }
    
    global class Results {
        @AuraEnabled
        public String feedItemId;
        
    }
    @AuraEnabled(cacheable=true)
    public static List<User> searchUsers(String query,List<String> selectedRecId) {
        List<User> result;
        
        Map<String,String> userNameToIdMap = new Map<String,String>();
        if(String.isNotBlank(query)||String.isNotEmpty(query)){
            String sWildCardText = '%' + query + '%';
            
            String sQuery = 'Select id,name,smallPhotoUrl,companyName,title From User Where Name Like : sWildCardText and Profile.Name =:PROFILE_NAME and Id NOT IN: selectedRecId order by createdDate DESC LIMIT 5';
            
            
            result = Database.query(sQuery);
        }else{
            String sQuery = 'Select id,name,smallPhotoUrl,companyName,title FROM User WHERE Name Like:sWildCardText and Profile.Name =:PROFILE_NAME and Id NOT IN:selectedRecId';
            result = Database.query(sQuery);
        }
        
        for(User u: result){
            
            userNameToIdMap.put(u.name, u.id);
        }
        return result;
    }
    
    public class SearchUser {
        @AuraEnabled
        public String id { get; private set; }
        @AuraEnabled
        public String name { get; set; }
        @AuraEnabled
        public String smallPhotoUrl { get; set; }
        @AuraEnabled
        public String companyName { get; set; }
        @AuraEnabled
        public String title { get; set; }
        
        public SearchUser(ConnectApi.User user) {
            this.id = user.id;
            this.name = user.displayName;
            this.smallPhotoUrl = user.photo.smallPhotoUrl;
            this.companyName = user.companyName;
            this.title = user.title;
        }
    }
    @AuraEnabled
    global static void editPost(String strbody,String feedElementId,String strcommunityId) {
        String communityId = strcommunityId;
        if (communityId == null)
            communityId = Network.getNetworkId();
        ConnectApi.FeedItemInput feedItemInput = new ConnectApi.FeedItemInput();
        ConnectApi.MessageBodyInput messageBodyInput = new ConnectApi.MessageBodyInput();
        ConnectApi.TextSegmentInput textSegmentInput = new ConnectApi.TextSegmentInput();
        messageBodyInput.messageSegments = new List<ConnectApi.MessageSegmentInput>();
        textSegmentInput.text = strbody;
        messageBodyInput.messageSegments.add(textSegmentInput);
        feedItemInput.body = messageBodyInput;
        ConnectApi.FeedElement editedFeedElement = ConnectApi.ChatterFeeds.updateFeedElement(communityId, feedElementId, feedItemInput);
        System.debug('edited feed element'+editedFeedElement);    
    }
    @AuraEnabled
    public static void deletePost(String recordId){
        try{
            delete new feedItem(Id = recordId);
        }
        catch (Exception e) {
            // Handle the exception appropriately
            throw new AuraHandledException('Error deleting record: ' + e.getMessage());
        }
    }
    
}