public without sharing class ChatterFeedController{
    @AuraEnabled(cacheable=true)
   public static List<sobject> getChatterFeedItems(String recordId) {
       /*List<sobject> feedsList =[Select id,title,body,Type from leadfeed where type='TextPost'];
        system.debug('feeds list--> '+feedsList);
        return feedsList;*/
      // recordId='00Q6s000003yMbcEAE';
       List<FeedItem> chatterPosts = [SELECT Id, Body, CreatedDate, CreatedById, CreatedBy.Name
                               FROM FeedItem
                               WHERE ParentId = :recordId AND Type = 'TextPost'
                               ORDER BY CreatedDate DESC];
       system.debug('chatter posts : '+chatterPosts);
       return chatterPosts;
	
    }
   /* public static List<ConnectApi.FeedElement> getChatterFeedForRecord(Id recordId) {
        // Call ConnectApi.ChatterFeeds.getFeedElements() to retrieve chatter feed for the record
        //List<ConnectApi.FeedElement> feedElements = new List<ConnectApi.FeedElement>();
        List<ConnectApi.FeedElement> fep = new List<ConnectApi.FeedElement>();
        ConnectApi.FeedElement el;
        try {
          //  feedElements = ConnectApi.ChatterFeeds.getFeedElements(null, ConnectApi.FeedType.Record, recordId);
             el = ConnectApi.ChatterFeeds.getFeedElement(Network.getNetworkId(), '0D56s00000SR9m6CAD');

        } catch (ConnectApi.ConnectApiException ex) {
            // Handle exception
        }
        system.debug('el'+el);
        fep.add(el);
        return fep;
    }*/
}