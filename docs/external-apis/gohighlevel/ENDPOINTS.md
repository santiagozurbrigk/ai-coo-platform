# GoHighLevel — todos los endpoints REST

Tabla plana de los **634** endpoints documentados en la versión current (v3), ordenada por path.

Base URL de la API: `https://services.leadconnectorhq.com`

| Path | Método | Recurso | Operación | Doc |
| --- | --- | --- | --- | --- |
| `/ad-publishing/facebook/ad-accounts` | `GET` | ad-publishing | Get ad accounts | [ver](./ghl/ad-publishing/fb-get-ad-accounts.md) |
| `/ad-publishing/facebook/ad-accounts/:adAccountId` | `DELETE` | ad-publishing | Delete ad account | [ver](./ghl/ad-publishing/fb-delete-ad-account.md) |
| `/ad-publishing/facebook/ad-accounts/:adAccountId` | `GET` | ad-publishing | Get ad account details | [ver](./ghl/ad-publishing/fb-get-ad-account.md) |
| `/ad-publishing/facebook/ads` | `PUT` | ad-publishing | Upsert ad | [ver](./ghl/ad-publishing/fb-upsert-ad.md) |
| `/ad-publishing/facebook/ads/:adId` | `DELETE` | ad-publishing | Delete ad | [ver](./ghl/ad-publishing/fb-delete-ad.md) |
| `/ad-publishing/facebook/ads/:adId/duplicate` | `POST` | ad-publishing | Duplicate ad | [ver](./ghl/ad-publishing/fb-duplicate-ad.md) |
| `/ad-publishing/facebook/ads/:adId/pause` | `POST` | ad-publishing | Pause ad | [ver](./ghl/ad-publishing/fb-pause-ad.md) |
| `/ad-publishing/facebook/ads/:adId/resume` | `POST` | ad-publishing | Resume ad | [ver](./ghl/ad-publishing/fb-resume-ad.md) |
| `/ad-publishing/facebook/adsets` | `PUT` | ad-publishing | Upsert adset | [ver](./ghl/ad-publishing/fb-upsert-adset.md) |
| `/ad-publishing/facebook/adsets/:adSetId` | `DELETE` | ad-publishing | Delete ad set | [ver](./ghl/ad-publishing/fb-delete-adset.md) |
| `/ad-publishing/facebook/adsets/:adSetId/duplicate` | `POST` | ad-publishing | Duplicate ad set | [ver](./ghl/ad-publishing/fb-duplicate-adset.md) |
| `/ad-publishing/facebook/adsets/:adSetId/pause` | `POST` | ad-publishing | Pause ad set | [ver](./ghl/ad-publishing/fb-pause-adset.md) |
| `/ad-publishing/facebook/adsets/:adSetId/resume` | `POST` | ad-publishing | Resume ad set | [ver](./ghl/ad-publishing/fb-resume-adset.md) |
| `/ad-publishing/facebook/campaign/:campaignId` | `GET` | ad-publishing | Get campaign with linked entities | [ver](./ghl/ad-publishing/fb-get-campaign.md) |
| `/ad-publishing/facebook/campaigns` | `PUT` | ad-publishing | Upsert campaign | [ver](./ghl/ad-publishing/fb-upsert-campaign.md) |
| `/ad-publishing/facebook/campaigns/:campaignId` | `DELETE` | ad-publishing | Delete campaign | [ver](./ghl/ad-publishing/fb-delete-campaign.md) |
| `/ad-publishing/facebook/campaigns/:campaignId/duplicate` | `POST` | ad-publishing | Duplicate campaign | [ver](./ghl/ad-publishing/fb-duplicate-campaign.md) |
| `/ad-publishing/facebook/campaigns/:campaignId/pause` | `POST` | ad-publishing | Pause campaign | [ver](./ghl/ad-publishing/fb-pause-campaign.md) |
| `/ad-publishing/facebook/campaigns/:campaignId/publish` | `POST` | ad-publishing | Publish campaign | [ver](./ghl/ad-publishing/fb-publish-campaign.md) |
| `/ad-publishing/facebook/campaigns/:campaignId/publishing-progress` | `GET` | ad-publishing | Get campaign publishing progress | [ver](./ghl/ad-publishing/fb-get-campaign-publishing-progress.md) |
| `/ad-publishing/facebook/campaigns/:campaignId/resume` | `POST` | ad-publishing | Resume campaign | [ver](./ghl/ad-publishing/fb-resume-campaign.md) |
| `/ad-publishing/facebook/conversation-forms` | `GET` | ad-publishing | Get conversation forms | [ver](./ghl/ad-publishing/fb-get-conversation-forms.md) |
| `/ad-publishing/facebook/conversation-forms` | `POST` | ad-publishing | Create conversation form | [ver](./ghl/ad-publishing/fb-create-conversation-form.md) |
| `/ad-publishing/facebook/custom-audience` | `GET` | ad-publishing | Get custom audiences | [ver](./ghl/ad-publishing/fb-get-custom-audiences.md) |
| `/ad-publishing/facebook/custom-audience/:audienceId` | `DELETE` | ad-publishing | Delete custom audience | [ver](./ghl/ad-publishing/fb-delete-custom-audience.md) |
| `/ad-publishing/facebook/custom-audience/:audienceId` | `GET` | ad-publishing | Get custom audience by ID | [ver](./ghl/ad-publishing/fb-get-custom-audience-by-id.md) |
| `/ad-publishing/facebook/custom-audience/:audienceId` | `PUT` | ad-publishing | Update custom audience | [ver](./ghl/ad-publishing/fb-update-custom-audience.md) |
| `/ad-publishing/facebook/custom-audience/:audienceId/member` | `DELETE` | ad-publishing | Remove custom audience member | [ver](./ghl/ad-publishing/fb-remove-custom-audience-member.md) |
| `/ad-publishing/facebook/custom-audience/:audienceId/member` | `PUT` | ad-publishing | Add custom audience member | [ver](./ghl/ad-publishing/fb-add-custom-audience-member.md) |
| `/ad-publishing/facebook/custom-audience/:audienceId/member/batch` | `PUT` | ad-publishing | Batch update audience members | [ver](./ghl/ad-publishing/fb-batch-update-audience-members.md) |
| `/ad-publishing/facebook/entity` | `GET` | ad-publishing | Get entities | [ver](./ghl/ad-publishing/fb-get-entity.md) |
| `/ad-publishing/facebook/integration` | `DELETE` | ad-publishing | Delete Facebook integration | [ver](./ghl/ad-publishing/fb-delete-integration.md) |
| `/ad-publishing/facebook/integration` | `GET` | ad-publishing | Get Facebook integration | [ver](./ghl/ad-publishing/fb-get-integration.md) |
| `/ad-publishing/facebook/integration` | `POST` | ad-publishing | Create Facebook integration | [ver](./ghl/ad-publishing/fb-create-integration.md) |
| `/ad-publishing/facebook/lead-form/:leadFormId` | `GET` | ad-publishing | Get lead form by ID | [ver](./ghl/ad-publishing/fb-get-lead-form.md) |
| `/ad-publishing/facebook/me` | `GET` | ad-publishing | Get current Facebook user | [ver](./ghl/ad-publishing/fb-get-current-user.md) |
| `/ad-publishing/facebook/page` | `DELETE` | ad-publishing | Delete page connection | [ver](./ghl/ad-publishing/fb-delete-page.md) |
| `/ad-publishing/facebook/page/:pageId/forms` | `GET` | ad-publishing | Get page lead forms | [ver](./ghl/ad-publishing/fb-get-page-lead-forms.md) |
| `/ad-publishing/facebook/page/:pageId/forms` | `POST` | ad-publishing | Create page lead form | [ver](./ghl/ad-publishing/fb-create-page-lead-form.md) |
| `/ad-publishing/facebook/page/:pageId/instagram` | `GET` | ad-publishing | Get Instagram accounts for page | [ver](./ghl/ad-publishing/fb-get-instagram-accounts.md) |
| `/ad-publishing/facebook/page/default` | `PUT` | ad-publishing | Set default page | [ver](./ghl/ad-publishing/fb-set-default-page.md) |
| `/ad-publishing/facebook/pages` | `GET` | ad-publishing | Get Facebook pages | [ver](./ghl/ad-publishing/fb-get-pages.md) |
| `/ad-publishing/facebook/pixels` | `GET` | ad-publishing | Get conversion pixels | [ver](./ghl/ad-publishing/fb-get-pixels.md) |
| `/ad-publishing/facebook/pixels` | `PUT` | ad-publishing | Upsert conversion pixel | [ver](./ghl/ad-publishing/fb-upsert-pixel.md) |
| `/ad-publishing/facebook/reporting` | `GET` | ad-publishing | Get reporting data | [ver](./ghl/ad-publishing/fb-get-reporting.md) |
| `/ad-publishing/facebook/reporting/campaign/:campaignId` | `GET` | ad-publishing | Get campaign reporting | [ver](./ghl/ad-publishing/fb-get-campaign-reporting.md) |
| `/ad-publishing/facebook/reporting/list` | `GET` | ad-publishing | Get reporting list | [ver](./ghl/ad-publishing/fb-get-reporting-list.md) |
| `/ad-publishing/facebook/targeting/search` | `GET` | ad-publishing | Search targeting options | [ver](./ghl/ad-publishing/fb-search-targeting.md) |
| `/ad-publishing/google/ad-accounts` | `GET` | ad-publishing | Get Google ad accounts | [ver](./ghl/ad-publishing/google-get-ad-accounts.md) |
| `/ad-publishing/google/ad-accounts/:adAccountId` | `DELETE` | ad-publishing | Delete ad account | [ver](./ghl/ad-publishing/google-delete-ad-account.md) |
| `/ad-publishing/google/ad-accounts/:adAccountId` | `GET` | ad-publishing | Get ad account details | [ver](./ghl/ad-publishing/google-get-ad-account-details.md) |
| `/ad-publishing/google/ads` | `PUT` | ad-publishing | Upsert Google campaign | [ver](./ghl/ad-publishing/google-upsert-campaign.md) |
| `/ad-publishing/google/ads/:adId` | `GET` | ad-publishing | Get Google campaign by ID | [ver](./ghl/ad-publishing/google-get-campaign-by-id.md) |
| `/ad-publishing/google/ads/:adId/publish` | `POST` | ad-publishing | Publish ad | [ver](./ghl/ad-publishing/google-publish-ad.md) |
| `/ad-publishing/google/ads/:adId/publishing-progress` | `GET` | ad-publishing | Get ad publishing progress | [ver](./ghl/ad-publishing/google-get-publishing-progress.md) |
| `/ad-publishing/google/assets` | `GET` | ad-publishing | Get assets | [ver](./ghl/ad-publishing/google-get-assets.md) |
| `/ad-publishing/google/assets` | `POST` | ad-publishing | Upsert assets | [ver](./ghl/ad-publishing/google-upsert-assets.md) |
| `/ad-publishing/google/audiences` | `GET` | ad-publishing | Get audiences | [ver](./ghl/ad-publishing/google-get-audiences.md) |
| `/ad-publishing/google/audiences` | `PUT` | ad-publishing | Upsert audience | [ver](./ghl/ad-publishing/google-upsert-audience.md) |
| `/ad-publishing/google/audiences/:audienceId` | `GET` | ad-publishing | Get audience by ID | [ver](./ghl/ad-publishing/google-get-audience-by-id.md) |
| `/ad-publishing/google/conversion-goals` | `GET` | ad-publishing | Get conversion goals | [ver](./ghl/ad-publishing/google-get-conversion-goals.md) |
| `/ad-publishing/google/conversions` | `GET` | ad-publishing | Get conversions | [ver](./ghl/ad-publishing/google-get-conversions.md) |
| `/ad-publishing/google/conversions` | `PUT` | ad-publishing | Upsert conversion | [ver](./ghl/ad-publishing/google-upsert-conversion.md) |
| `/ad-publishing/google/conversions/:conversionId` | `DELETE` | ad-publishing | Delete conversion | [ver](./ghl/ad-publishing/google-delete-conversion.md) |
| `/ad-publishing/google/conversions/:conversionId` | `GET` | ad-publishing | Get conversion by ID | [ver](./ghl/ad-publishing/google-get-conversion-by-id.md) |
| `/ad-publishing/google/entity` | `GET` | ad-publishing | Get entities | [ver](./ghl/ad-publishing/google-get-entity.md) |
| `/ad-publishing/google/integration` | `GET` | ad-publishing | Get Google integration | [ver](./ghl/ad-publishing/google-get-integration.md) |
| `/ad-publishing/google/integration` | `POST` | ad-publishing | Create Google integration | [ver](./ghl/ad-publishing/google-create-integration.md) |
| `/ad-publishing/google/keyword-ideas` | `POST` | ad-publishing | Get keyword ideas | [ver](./ghl/ad-publishing/google-get-keyword-ideas.md) |
| `/ad-publishing/google/me` | `GET` | ad-publishing | Get current Google user | [ver](./ghl/ad-publishing/google-get-current-user.md) |
| `/ad-publishing/google/reporting` | `GET` | ad-publishing | Get reporting data | [ver](./ghl/ad-publishing/google-get-reporting.md) |
| `/ad-publishing/google/reporting/campaign/:campaignId` | `GET` | ad-publishing | Get campaign reporting | [ver](./ghl/ad-publishing/google-get-campaign-reporting.md) |
| `/ad-publishing/google/reporting/list` | `GET` | ad-publishing | Get reporting list | [ver](./ghl/ad-publishing/google-get-reporting-list.md) |
| `/ad-publishing/google/segments` | `GET` | ad-publishing | Get segments | [ver](./ghl/ad-publishing/google-get-segments.md) |
| `/ad-publishing/google/segments` | `PUT` | ad-publishing | Upsert segment | [ver](./ghl/ad-publishing/google-upsert-segment.md) |
| `/ad-publishing/google/segments/:segmentId` | `DELETE` | ad-publishing | Delete segment | [ver](./ghl/ad-publishing/google-delete-segment.md) |
| `/ad-publishing/google/segments/:segmentId` | `GET` | ad-publishing | Get segment by ID | [ver](./ghl/ad-publishing/google-get-segment-by-id.md) |
| `/ad-publishing/google/segments/offline-user-list-job` | `POST` | ad-publishing | Create offline user list job | [ver](./ghl/ad-publishing/google-create-offline-user-list-job.md) |
| `/ad-publishing/google/target-interests` | `GET` | ad-publishing | Get target interests | [ver](./ghl/ad-publishing/google-get-target-interests.md) |
| `/ad-publishing/google/targeting/search` | `GET` | ad-publishing | Search targeting options | [ver](./ghl/ad-publishing/google-search-targeting.md) |
| `/ad-publishing/linkedin/:accountId/form` | `POST` | ad-publishing | Create lead form | [ver](./ghl/ad-publishing/li-create-lead-form.md) |
| `/ad-publishing/linkedin/:accountId/forms` | `GET` | ad-publishing | Get lead forms | [ver](./ghl/ad-publishing/li-get-lead-forms.md) |
| `/ad-publishing/linkedin/:adId/status` | `PATCH` | ad-publishing | Update ad status | [ver](./ghl/ad-publishing/li-update-ad-status.md) |
| `/ad-publishing/linkedin/ad-account` | `DELETE` | ad-publishing | Delete ad account | [ver](./ghl/ad-publishing/li-delete-ad-account.md) |
| `/ad-publishing/linkedin/ad-account` | `GET` | ad-publishing | Get ad account details | [ver](./ghl/ad-publishing/li-get-ad-account-details.md) |
| `/ad-publishing/linkedin/ad-accounts` | `GET` | ad-publishing | Get LinkedIn ad accounts | [ver](./ghl/ad-publishing/li-get-ad-accounts.md) |
| `/ad-publishing/linkedin/ads` | `PUT` | ad-publishing | Upsert ad campaign group | [ver](./ghl/ad-publishing/li-upsert-campaign-group.md) |
| `/ad-publishing/linkedin/ads/:adId` | `GET` | ad-publishing | Get ad campaign group | [ver](./ghl/ad-publishing/li-get-campaign-group.md) |
| `/ad-publishing/linkedin/ads/:adId/publish` | `POST` | ad-publishing | Publish ad campaign group | [ver](./ghl/ad-publishing/li-publish-campaign-group.md) |
| `/ad-publishing/linkedin/integration` | `GET` | ad-publishing | Get LinkedIn integration | [ver](./ghl/ad-publishing/li-get-integration.md) |
| `/ad-publishing/linkedin/integration` | `POST` | ad-publishing | Create LinkedIn integration | [ver](./ghl/ad-publishing/li-create-integration.md) |
| `/ad-publishing/linkedin/me` | `GET` | ad-publishing | Get current LinkedIn user | [ver](./ghl/ad-publishing/li-get-current-user.md) |
| `/ad-publishing/linkedin/reporting` | `GET` | ad-publishing | Get ad analytics | [ver](./ghl/ad-publishing/li-get-ad-analytics.md) |
| `/ad-publishing/linkedin/reporting/campaign-group/:campaignGroupId` | `GET` | ad-publishing | Get campaign group reporting | [ver](./ghl/ad-publishing/li-get-campaign-group-reporting.md) |
| `/ad-publishing/linkedin/reporting/list` | `GET` | ad-publishing | Get reporting list | [ver](./ghl/ad-publishing/li-get-reporting-list.md) |
| `/ad-publishing/linkedin/targeting/search` | `GET` | ad-publishing | Search targeting options | [ver](./ghl/ad-publishing/li-search-targeting.md) |
| `/affiliate-manager/:locationId/affiliates` | `GET` | affiliate-manager | List Affiliates | [ver](./ghl/affiliate-manager/list-affiliates.md) |
| `/affiliate-manager/:locationId/affiliates/:affiliateId` | `GET` | affiliate-manager | Get Affiliate | [ver](./ghl/affiliate-manager/get-affiliate.md) |
| `/affiliate-manager/:locationId/commissions` | `GET` | affiliate-manager | List Commissions | [ver](./ghl/affiliate-manager/list-commissions.md) |
| `/affiliate-manager/:locationId/payouts` | `GET` | affiliate-manager | List Payouts | [ver](./ghl/affiliate-manager/list-payouts.md) |
| `/agent-studio/agent` | `GET` | agent-studio | List Agents | [ver](./ghl/agent-studio/get-agents.md) |
| `/agent-studio/agent` | `POST` | agent-studio | Create Agent | [ver](./ghl/agent-studio/create-agent.md) |
| `/agent-studio/agent/:agentId` | `DELETE` | agent-studio | Delete Agent | [ver](./ghl/agent-studio/delete-agent.md) |
| `/agent-studio/agent/:agentId` | `GET` | agent-studio | Get Agent | [ver](./ghl/agent-studio/get-agent-by-id.md) |
| `/agent-studio/agent/:agentId` | `PATCH` | agent-studio | Update Agent Metadata | [ver](./ghl/agent-studio/update-agent-metadata.md) |
| `/agent-studio/agent/:agentId/execute` | `POST` | agent-studio | Execute Agent | [ver](./ghl/agent-studio/execute-agent.md) |
| `/agent-studio/agent/versions/:versionId` | `PATCH` | agent-studio | Update Agent | [ver](./ghl/agent-studio/update-agent-version.md) |
| `/agent-studio/agent/versions/:versionId/publish` | `POST` | agent-studio | Promote to Production | [ver](./ghl/agent-studio/promote-and-publish.md) |
| `/agent-studio/public-api/agents` | `GET` | agent-studio | List Agents (Deprecated) | [ver](./ghl/agent-studio/get-agents-deprecated.md) |
| `/agent-studio/public-api/agents/:agentId` | `GET` | agent-studio | Get Agent (Deprecated) | [ver](./ghl/agent-studio/get-agent-by-id-deprecated.md) |
| `/agent-studio/public-api/agents/:agentId/execute` | `POST` | agent-studio | Execute Agent (Deprecated) | [ver](./ghl/agent-studio/execute-agent-deprecated.md) |
| `/associations/` | `GET` | associations | Get all associations for a sub-account / location | [ver](./ghl/associations/find-associations.md) |
| `/associations/` | `POST` | associations | Create Association | [ver](./ghl/associations/create-association.md) |
| `/associations/:associationId` | `DELETE` | associations | Delete Association | [ver](./ghl/associations/delete-association.md) |
| `/associations/:associationId` | `GET` | associations | Get association by ID | [ver](./ghl/associations/get-association-by-id.md) |
| `/associations/:associationId` | `PUT` | associations | Update Association By Id | [ver](./ghl/associations/update-association.md) |
| `/associations/key/:key_name` | `GET` | associations | Get association key by key name | [ver](./ghl/associations/get-association-key-by-key-name.md) |
| `/associations/objectKey/:objectKey` | `GET` | associations | Get association by object keys | [ver](./ghl/associations/get-association-by-object-keys.md) |
| `/associations/relations` | `POST` | associations | Create Relation for you associated entities. | [ver](./ghl/associations/create-relation.md) |
| `/associations/relations/:recordId` | `GET` | associations | Get all relations By record Id | [ver](./ghl/associations/get-relations-by-record-id.md) |
| `/associations/relations/:relationId` | `DELETE` | associations | Delete Relation | [ver](./ghl/associations/delete-relation.md) |
| `/blogs/authors` | `GET` | blogs | Get all authors | [ver](./ghl/blogs/get-all-blog-authors-by-location.md) |
| `/blogs/categories` | `GET` | blogs | Get all categories | [ver](./ghl/blogs/get-all-categories-by-location.md) |
| `/blogs/posts` | `POST` | blogs | Create Blog Post | [ver](./ghl/blogs/create-blog-post.md) |
| `/blogs/posts/:postId` | `PUT` | blogs | Update Blog Post | [ver](./ghl/blogs/update-blog-post.md) |
| `/blogs/posts/all` | `GET` | blogs | Get Blog posts by Blog ID | [ver](./ghl/blogs/get-blog-post.md) |
| `/blogs/posts/url-slug-exists` | `GET` | blogs | Check url slug | [ver](./ghl/blogs/check-url-slug-exists.md) |
| `/blogs/site/all` | `GET` | blogs | Get Blogs by Location ID | [ver](./ghl/blogs/get-blogs.md) |
| `/brand-boards/locations/:locationId/brand-voices` | `GET` | brand-boards | List Brand Voices | [ver](./ghl/brand-boards/list-brand-voices.md) |
| `/brand-boards/locations/:locationId/brand-voices` | `POST` | brand-boards | Create Brand Voice | [ver](./ghl/brand-boards/create-brand-voice.md) |
| `/brand-boards/locations/:locationId/brand-voices/:brandVoiceId` | `DELETE` | brand-boards | Delete Brand Voice | [ver](./ghl/brand-boards/delete-brand-voice.md) |
| `/brand-boards/locations/:locationId/brand-voices/:brandVoiceId` | `GET` | brand-boards | Get Brand Voice | [ver](./ghl/brand-boards/get-brand-voice.md) |
| `/brand-boards/locations/:locationId/brand-voices/:brandVoiceId` | `PATCH` | brand-boards | Update Brand Voice | [ver](./ghl/brand-boards/update-brand-voice.md) |
| `/brand-boards/locations/:locationId/brand-voices/:brandVoiceId/default` | `POST` | brand-boards | Set Default Brand Voice | [ver](./ghl/brand-boards/set-default-brand-voice.md) |
| `/brand-boards/locations/:locationId/design-kits` | `GET` | brand-boards | List Design Kits | [ver](./ghl/brand-boards/list-design-kits.md) |
| `/brand-boards/locations/:locationId/design-kits` | `POST` | brand-boards | Create Design Kit | [ver](./ghl/brand-boards/create-design-kit.md) |
| `/brand-boards/locations/:locationId/design-kits/:designKitId` | `DELETE` | brand-boards | Delete Design Kit | [ver](./ghl/brand-boards/delete-design-kit.md) |
| `/brand-boards/locations/:locationId/design-kits/:designKitId` | `GET` | brand-boards | Get Design Kit | [ver](./ghl/brand-boards/get-design-kit.md) |
| `/brand-boards/locations/:locationId/design-kits/:designKitId` | `PATCH` | brand-boards | Update Design Kit | [ver](./ghl/brand-boards/update-design-kit.md) |
| `/brand-boards/locations/:locationId/design-kits/:designKitId/default` | `POST` | brand-boards | Set Default Design Kit | [ver](./ghl/brand-boards/set-default-design-kit.md) |
| `/businesses/` | `GET` | businesses | Get Businesses by Location | [ver](./ghl/businesses/get-businesses-by-location.md) |
| `/businesses/` | `POST` | businesses | Create Business | [ver](./ghl/businesses/create-business.md) |
| `/businesses/:businessId` | `DELETE` | businesses | Delete Business | [ver](./ghl/businesses/delete-business.md) |
| `/businesses/:businessId` | `GET` | businesses | Get Business | [ver](./ghl/businesses/get-business.md) |
| `/businesses/:businessId` | `PUT` | businesses | Update Business | [ver](./ghl/businesses/update-business.md) |
| `/calendars/` | `GET` | calendars | Get Calendars | [ver](./ghl/calendars/get-calendars.md) |
| `/calendars/` | `POST` | calendars | Create Calendar | [ver](./ghl/calendars/create-calendar.md) |
| `/calendars/:calendarId` | `DELETE` | calendars | Delete Calendar | [ver](./ghl/calendars/delete-calendar.md) |
| `/calendars/:calendarId` | `GET` | calendars | Get Calendar | [ver](./ghl/calendars/get-calendar.md) |
| `/calendars/:calendarId` | `PUT` | calendars | Update Calendar | [ver](./ghl/calendars/update-calendar.md) |
| `/calendars/:calendarId/free-slots` | `GET` | calendars | Get Free Slots | [ver](./ghl/calendars/get-slots.md) |
| `/calendars/:calendarId/notifications` | `GET` | calendars | Get notifications | [ver](./ghl/calendars/get-event-notification.md) |
| `/calendars/:calendarId/notifications` | `POST` | calendars | Create notification | [ver](./ghl/calendars/create-event-notification.md) |
| `/calendars/:calendarId/notifications/:notificationId` | `DELETE` | calendars | Delete Notification | [ver](./ghl/calendars/delete-event-notification.md) |
| `/calendars/:calendarId/notifications/:notificationId` | `GET` | calendars | Get notification | [ver](./ghl/calendars/find-event-notification.md) |
| `/calendars/:calendarId/notifications/:notificationId` | `PUT` | calendars | Update notification | [ver](./ghl/calendars/update-event-notification.md) |
| `/calendars/appointments/:appointmentId/notes` | `GET` | calendars | Get Notes | [ver](./ghl/calendars/get-appointment-notes.md) |
| `/calendars/appointments/:appointmentId/notes` | `POST` | calendars | Create Note | [ver](./ghl/calendars/create-appointment-note.md) |
| `/calendars/appointments/:appointmentId/notes/:noteId` | `DELETE` | calendars | Delete Note | [ver](./ghl/calendars/delete-appointment-note.md) |
| `/calendars/appointments/:appointmentId/notes/:noteId` | `PUT` | calendars | Update Note | [ver](./ghl/calendars/update-appointment-note.md) |
| `/calendars/blocked-slots` | `GET` | calendars | Get Blocked Slots | [ver](./ghl/calendars/get-blocked-slots.md) |
| `/calendars/events` | `GET` | calendars | Get Calendar Events | [ver](./ghl/calendars/get-calendar-events.md) |
| `/calendars/events/:eventId` | `DELETE` | calendars | Delete Event | [ver](./ghl/calendars/delete-event.md) |
| `/calendars/events/appointments` | `POST` | calendars | Create appointment | [ver](./ghl/calendars/create-appointment.md) |
| `/calendars/events/appointments/:eventId` | `GET` | calendars | Get Appointment | [ver](./ghl/calendars/get-appointment.md) |
| `/calendars/events/appointments/:eventId` | `PUT` | calendars | Update Appointment | [ver](./ghl/calendars/edit-appointment.md) |
| `/calendars/events/block-slots` | `POST` | calendars | Create Block Slot | [ver](./ghl/calendars/create-block-slot.md) |
| `/calendars/events/block-slots/:eventId` | `PUT` | calendars | Update Block Slot | [ver](./ghl/calendars/edit-block-slot.md) |
| `/calendars/groups` | `GET` | calendars | Get Groups | [ver](./ghl/calendars/get-groups.md) |
| `/calendars/groups` | `POST` | calendars | Create Calendar Group | [ver](./ghl/calendars/create-calendar-group.md) |
| `/calendars/groups/:groupId` | `DELETE` | calendars | Delete Group | [ver](./ghl/calendars/delete-group.md) |
| `/calendars/groups/:groupId` | `PUT` | calendars | Update Group | [ver](./ghl/calendars/edit-group.md) |
| `/calendars/groups/:groupId/status` | `PUT` | calendars | Disable Group | [ver](./ghl/calendars/disable-group.md) |
| `/calendars/groups/validate-slug` | `POST` | calendars | Validate group slug | [ver](./ghl/calendars/validate-groups-slug.md) |
| `/calendars/resources/:resourceType` | `GET` | calendars | List Calendar Resources | [ver](./ghl/calendars/fetch-calendar-resources.md) |
| `/calendars/resources/:resourceType` | `POST` | calendars | Create Calendar Resource | [ver](./ghl/calendars/create-calendar-resource.md) |
| `/calendars/resources/:resourceType/:id` | `DELETE` | calendars | Delete Calendar Resource | [ver](./ghl/calendars/delete-calendar-resource.md) |
| `/calendars/resources/:resourceType/:id` | `GET` | calendars | Get Calendar Resource | [ver](./ghl/calendars/get-calendar-resource.md) |
| `/calendars/resources/:resourceType/:id` | `PUT` | calendars | Update Calendar Resource | [ver](./ghl/calendars/update-calendar-resource.md) |
| `/calendars/schedules` | `POST` | calendars | Create user availability schedule | [ver](./ghl/calendars/create-schedule.md) |
| `/calendars/schedules/:id` | `DELETE` | calendars | Delete user availability schedule | [ver](./ghl/calendars/delete-schedule.md) |
| `/calendars/schedules/:id` | `GET` | calendars | Get user availability schedule | [ver](./ghl/calendars/get-schedule-by-id.md) |
| `/calendars/schedules/:id` | `PUT` | calendars | Update user availability schedule | [ver](./ghl/calendars/update-schedule.md) |
| `/calendars/schedules/:id/associations/:calendarId` | `DELETE` | calendars | Remove user availability schedule from a calendar | [ver](./ghl/calendars/remove-calendar-from-schedule.md) |
| `/calendars/schedules/:id/associations/:calendarId` | `PUT` | calendars | Apply user availability schedule to a calendar | [ver](./ghl/calendars/add-calendar-to-schedule.md) |
| `/calendars/schedules/event-calendar/:calendarId` | `GET` | calendars | Get event calendar availability schedule | [ver](./ghl/calendars/get-calendar-schedule.md) |
| `/calendars/schedules/event-calendar/:calendarId` | `POST` | calendars | Create event calendar availability schedule | [ver](./ghl/calendars/create-calendar-schedule.md) |
| `/calendars/schedules/event-calendar/:calendarId` | `PUT` | calendars | Update event calendar availability schedule | [ver](./ghl/calendars/update-calendar-schedule.md) |
| `/calendars/schedules/search` | `GET` | calendars | List user availability schedule | [ver](./ghl/calendars/get-all-schedules.md) |
| `/calendars/services/bookings` | `GET` | calendars | Get Service Bookings | [ver](./ghl/calendars/get-service-bookings.md) |
| `/calendars/services/bookings` | `POST` | calendars | Create Service Booking | [ver](./ghl/calendars/create-service-booking.md) |
| `/calendars/services/bookings/:bookingId` | `DELETE` | calendars | Delete Service Booking | [ver](./ghl/calendars/delete-service-booking.md) |
| `/calendars/services/bookings/:bookingId` | `GET` | calendars | Get Service Booking by ID | [ver](./ghl/calendars/get-service-booking-by-id.md) |
| `/calendars/services/bookings/:bookingId` | `PUT` | calendars | Update Service Booking | [ver](./ghl/calendars/update-service-booking.md) |
| `/calendars/services/catalog` | `GET` | calendars | Get Services | [ver](./ghl/calendars/get-services-catalog.md) |
| `/calendars/services/catalog` | `POST` | calendars | Create Service | [ver](./ghl/calendars/create-service-catalog.md) |
| `/calendars/services/catalog/:serviceId` | `DELETE` | calendars | Delete Service | [ver](./ghl/calendars/delete-service-catalog.md) |
| `/calendars/services/catalog/:serviceId` | `GET` | calendars | Get Service by ID | [ver](./ghl/calendars/get-service-catalog-by-id.md) |
| `/calendars/services/catalog/:serviceId` | `PUT` | calendars | Update Service | [ver](./ghl/calendars/update-service-catalog.md) |
| `/calendars/services/locations` | `GET` | calendars | Get Service Locations | [ver](./ghl/calendars/get-service-locations.md) |
| `/calendars/services/locations` | `POST` | calendars | Create Service Location | [ver](./ghl/calendars/create-service-location.md) |
| `/calendars/services/locations/:serviceLocationId` | `DELETE` | calendars | Delete Service Location | [ver](./ghl/calendars/delete-service-location.md) |
| `/calendars/services/locations/:serviceLocationId` | `GET` | calendars | Get Service Location by ID | [ver](./ghl/calendars/get-service-location-by-id.md) |
| `/calendars/services/locations/:serviceLocationId` | `PUT` | calendars | Update Service Location | [ver](./ghl/calendars/update-service-location.md) |
| `/campaigns/` | `GET` | campaigns | Get Campaigns | [ver](./ghl/campaigns/get-campaigns.md) |
| `/chat-widget/` | `POST` | chat-widget | Create a new chat widget | [ver](./ghl/chat-widget/create-chat-widget.md) |
| `/chat-widget/:locationId/:id` | `DELETE` | chat-widget | Delete a Chat Widget | [ver](./ghl/chat-widget/delete-chat-widget.md) |
| `/chat-widget/clone` | `POST` | chat-widget | Clone a Chat Widget | [ver](./ghl/chat-widget/clone-chat-widget.md) |
| `/chat-widget/data/:locationId/:id` | `GET` | chat-widget | Get Chat Widget by ID | [ver](./ghl/chat-widget/get-chat-widget-by-id.md) |
| `/chat-widget/data/:locationId/:id` | `PATCH` | chat-widget | Patch Chat Widget | [ver](./ghl/chat-widget/patch-chat-widget.md) |
| `/chat-widget/data/:locationId/:id` | `PUT` | chat-widget | Update Chat Widget | [ver](./ghl/chat-widget/update-chat-widget.md) |
| `/chat-widget/list` | `GET` | chat-widget | List Chat Widgets | [ver](./ghl/chat-widget/list-chat-widgets.md) |
| `/companies/:companyId` | `GET` | companies | Get Company | [ver](./ghl/companies/get-company.md) |
| `/contacts/` | `POST` | contacts | Create Contact | [ver](./ghl/contacts/create-contact.md) |
| `/contacts/:contactId` | `DELETE` | contacts | Delete Contact | [ver](./ghl/contacts/delete-contact.md) |
| `/contacts/:contactId` | `GET` | contacts | Get Contact | [ver](./ghl/contacts/get-contact.md) |
| `/contacts/:contactId` | `PUT` | contacts | Update Contact | [ver](./ghl/contacts/update-contact.md) |
| `/contacts/:contactId/appointments` | `GET` | contacts | Get Appointments for Contact | [ver](./ghl/contacts/get-appointments-for-contact.md) |
| `/contacts/:contactId/campaigns/:campaignId` | `DELETE` | contacts | Remove Contact From Campaign | [ver](./ghl/contacts/remove-contact-from-campaign.md) |
| `/contacts/:contactId/campaigns/:campaignId` | `POST` | contacts | Add Contact to Campaign | [ver](./ghl/contacts/add-contact-to-campaign.md) |
| `/contacts/:contactId/campaigns/remove-all` | `DELETE` | contacts | Remove Contact From Every Campaign | [ver](./ghl/contacts/remove-contact-from-every-campaign.md) |
| `/contacts/:contactId/followers` | `DELETE` | contacts | Remove Followers | [ver](./ghl/contacts/remove-followers-contact.md) |
| `/contacts/:contactId/followers` | `POST` | contacts | Add Followers | [ver](./ghl/contacts/add-followers-contact.md) |
| `/contacts/:contactId/notes` | `GET` | contacts | Get All Notes | [ver](./ghl/contacts/get-all-notes.md) |
| `/contacts/:contactId/notes` | `POST` | contacts | Create Note | [ver](./ghl/contacts/create-note.md) |
| `/contacts/:contactId/notes/:id` | `DELETE` | contacts | Delete Note | [ver](./ghl/contacts/delete-note.md) |
| `/contacts/:contactId/notes/:id` | `GET` | contacts | Get Note | [ver](./ghl/contacts/get-note.md) |
| `/contacts/:contactId/notes/:id` | `PUT` | contacts | Update Note | [ver](./ghl/contacts/update-note.md) |
| `/contacts/:contactId/tags` | `DELETE` | contacts | Remove Tags | [ver](./ghl/contacts/remove-tags.md) |
| `/contacts/:contactId/tags` | `POST` | contacts | Add Tags | [ver](./ghl/contacts/add-tags.md) |
| `/contacts/:contactId/tasks` | `GET` | contacts | Get all Tasks | [ver](./ghl/contacts/get-all-tasks.md) |
| `/contacts/:contactId/tasks` | `POST` | contacts | Create Task | [ver](./ghl/contacts/create-task.md) |
| `/contacts/:contactId/tasks/:taskId` | `DELETE` | contacts | Delete Task | [ver](./ghl/contacts/delete-task.md) |
| `/contacts/:contactId/tasks/:taskId` | `GET` | contacts | Get Task | [ver](./ghl/contacts/get-task.md) |
| `/contacts/:contactId/tasks/:taskId` | `PUT` | contacts | Update Task | [ver](./ghl/contacts/update-task.md) |
| `/contacts/:contactId/tasks/:taskId/completed` | `PUT` | contacts | Update Task Completed | [ver](./ghl/contacts/update-task-completed.md) |
| `/contacts/:contactId/workflow/:workflowId` | `DELETE` | contacts | Delete Contact from Workflow | [ver](./ghl/contacts/delete-contact-from-workflow.md) |
| `/contacts/:contactId/workflow/:workflowId` | `POST` | contacts | Add Contact to Workflow | [ver](./ghl/contacts/add-contact-to-workflow.md) |
| `/contacts/bulk/business` | `POST` | contacts | Add/Remove Contacts From Business | [ver](./ghl/contacts/add-remove-contact-from-business.md) |
| `/contacts/bulk/tags/update/:type` | `POST` | contacts | Update Contacts Tags | [ver](./ghl/contacts/create-association.md) |
| `/contacts/business/:businessId` | `GET` | contacts | Get Contacts By BusinessId | [ver](./ghl/contacts/get-contacts-by-business-id.md) |
| `/contacts/lookup` | `GET` | contacts | Lookup Contact By Email Or Phone | [ver](./ghl/contacts/lookup-contact.md) |
| `/contacts/search` | `POST` | contacts | Search Contacts | [ver](./ghl/contacts/search-contacts-advanced.md) |
| `/contacts/search/duplicate` | `GET` | contacts | Get Duplicate Contact | [ver](./ghl/contacts/get-duplicate-contact.md) |
| `/contacts/upsert` | `POST` | contacts | Upsert Contact | [ver](./ghl/contacts/upsert-contact.md) |
| `/conversation-ai/agents` | `POST` | conversation-ai | Create an Agent | [ver](./ghl/conversation-ai/create-agent.md) |
| `/conversation-ai/agents/:agentId` | `DELETE` | conversation-ai | Delete Agent | [ver](./ghl/conversation-ai/delete-agent.md) |
| `/conversation-ai/agents/:agentId` | `GET` | conversation-ai | Get Agent | [ver](./ghl/conversation-ai/get-agent.md) |
| `/conversation-ai/agents/:agentId` | `PUT` | conversation-ai | Update Agent | [ver](./ghl/conversation-ai/update-agent.md) |
| `/conversation-ai/agents/:agentId/actions` | `POST` | conversation-ai | Attach Action to Agent | [ver](./ghl/conversation-ai/create-action.md) |
| `/conversation-ai/agents/:agentId/actions/:actionId` | `DELETE` | conversation-ai | Remove Action from Agent | [ver](./ghl/conversation-ai/delete-action.md) |
| `/conversation-ai/agents/:agentId/actions/:actionId` | `GET` | conversation-ai | Get Action by ID | [ver](./ghl/conversation-ai/get-action-by-id.md) |
| `/conversation-ai/agents/:agentId/actions/:actionId` | `PUT` | conversation-ai | Update Action | [ver](./ghl/conversation-ai/update-action.md) |
| `/conversation-ai/agents/:agentId/actions/list` | `GET` | conversation-ai | List Actions for an Agent | [ver](./ghl/conversation-ai/list-actions.md) |
| `/conversation-ai/agents/:agentId/followup-settings` | `PATCH` | conversation-ai | Update Followup Settings | [ver](./ghl/conversation-ai/update-followup-settings.md) |
| `/conversation-ai/agents/search` | `GET` | conversation-ai | Search Agents | [ver](./ghl/conversation-ai/search-agent.md) |
| `/conversation-ai/generations` | `GET` | conversation-ai | Get the generation details | [ver](./ghl/conversation-ai/get-generation-details.md) |
| `/conversations/` | `POST` | conversations | Create Conversation | [ver](./ghl/conversations/create-conversation.md) |
| `/conversations/:conversationId` | `DELETE` | conversations | Delete Conversation | [ver](./ghl/conversations/delete-conversation.md) |
| `/conversations/:conversationId` | `GET` | conversations | Get Conversation | [ver](./ghl/conversations/get-conversation.md) |
| `/conversations/:conversationId` | `PUT` | conversations | Update Conversation | [ver](./ghl/conversations/update-conversation.md) |
| `/conversations/:conversationId/messages` | `GET` | conversations | Get messages by conversation id | [ver](./ghl/conversations/get-messages.md) |
| `/conversations/locations/:locationId/messages/:messageId/transcription` | `GET` | conversations | Get transcription by Message ID | [ver](./ghl/conversations/get-message-transcription.md) |
| `/conversations/locations/:locationId/messages/:messageId/transcription/download` | `GET` | conversations | Download transcription by Message ID | [ver](./ghl/conversations/download-message-transcription.md) |
| `/conversations/messages` | `POST` | conversations | Send a new message | [ver](./ghl/conversations/send-a-new-message.md) |
| `/conversations/messages/:id` | `GET` | conversations | Get message by message id | [ver](./ghl/conversations/get-message.md) |
| `/conversations/messages/:messageId/attachments` | `PUT` | conversations | Add message attachments | [ver](./ghl/conversations/add-message-attachments.md) |
| `/conversations/messages/:messageId/locations/:locationId/recording` | `GET` | conversations | Get Recording by Message ID | [ver](./ghl/conversations/get-message-recording.md) |
| `/conversations/messages/:messageId/schedule` | `DELETE` | conversations | Cancel a scheduled message. | [ver](./ghl/conversations/cancel-scheduled-message.md) |
| `/conversations/messages/:messageId/status` | `PUT` | conversations | Update message status | [ver](./ghl/conversations/update-message-status.md) |
| `/conversations/messages/email/:emailMessageId/schedule` | `DELETE` | conversations | Cancel a scheduled email message. | [ver](./ghl/conversations/cancel-scheduled-email-message.md) |
| `/conversations/messages/email/:emailMessageId/status` | `PUT` | conversations | Update email message status | [ver](./ghl/conversations/update-email-message-status.md) |
| `/conversations/messages/email/:id` | `GET` | conversations | Get email by Id | [ver](./ghl/conversations/get-email-by-id.md) |
| `/conversations/messages/export` | `GET` | conversations | Export messages by location ID | [ver](./ghl/conversations/export-messages-by-location.md) |
| `/conversations/messages/inbound` | `POST` | conversations | Add an inbound message | [ver](./ghl/conversations/add-an-inbound-message.md) |
| `/conversations/messages/outbound` | `POST` | conversations | Add an external outbound call | [ver](./ghl/conversations/add-an-outbound-message.md) |
| `/conversations/messages/upload` | `POST` | conversations | Upload file attachments | [ver](./ghl/conversations/upload-file-attachments.md) |
| `/conversations/providers/live-chat/typing` | `POST` | conversations | Agent/Ai-Bot is typing a message indicator for live chat | [ver](./ghl/conversations/live-chat-agent-typing.md) |
| `/conversations/search` | `GET` | conversations | Search Conversations | [ver](./ghl/conversations/search-conversation.md) |
| `/courses/courses-exporter/public/import` | `POST` | courses | Import Courses | [ver](./ghl/courses/import-courses.md) |
| `/custom-fields/` | `POST` | custom-fields | Create Custom Field | [ver](./ghl/custom-fields/create-custom-field.md) |
| `/custom-fields/:id` | `DELETE` | custom-fields | Delete Custom Field By Id | [ver](./ghl/custom-fields/delete-custom-field.md) |
| `/custom-fields/:id` | `GET` | custom-fields | Get Custom Field / Folder By Id | [ver](./ghl/custom-fields/get-custom-field-by-id.md) |
| `/custom-fields/:id` | `PUT` | custom-fields | Update Custom Field By Id | [ver](./ghl/custom-fields/update-custom-field.md) |
| `/custom-fields/folder` | `POST` | custom-fields | Create Custom Field Folder | [ver](./ghl/custom-fields/create-custom-field-folder.md) |
| `/custom-fields/folder/:id` | `DELETE` | custom-fields | Delete Custom Field Folder | [ver](./ghl/custom-fields/delete-custom-field-folder.md) |
| `/custom-fields/folder/:id` | `PUT` | custom-fields | Update Custom Field Folder Name | [ver](./ghl/custom-fields/update-custom-field-folder.md) |
| `/custom-fields/object-key/:objectKey` | `GET` | custom-fields | Get Custom Fields By Object Key | [ver](./ghl/custom-fields/get-custom-fields-by-object-key.md) |
| `/custom-menus/` | `GET` | custom-menus | Get Custom Menu Links | [ver](./ghl/custom-menus/get-custom-menus.md) |
| `/custom-menus/` | `POST` | custom-menus | Create Custom Menu Link | [ver](./ghl/custom-menus/create-custom-menu.md) |
| `/custom-menus/:customMenuId` | `DELETE` | custom-menus | Delete Custom Menu Link | [ver](./ghl/custom-menus/delete-custom-menu.md) |
| `/custom-menus/:customMenuId` | `GET` | custom-menus | Get Custom Menu Link | [ver](./ghl/custom-menus/get-custom-menu-by-id.md) |
| `/custom-menus/:customMenuId` | `PUT` | custom-menus | Update Custom Menu Link | [ver](./ghl/custom-menus/update-custom-menu.md) |
| `/email/verify` | `POST` | email-isv | Email Verification | [ver](./ghl/email-isv/verify-email.md) |
| `/emails/locations/:locationId/campaigns/bulk-actions` | `GET` | emails | List Bulk Action Campaigns | [ver](./ghl/emails/list-bulk-action-campaigns.md) |
| `/emails/locations/:locationId/campaigns/bulk-actions/:campaignId` | `GET` | emails | Get Bulk Action Campaign by ID | [ver](./ghl/emails/get-bulk-action-campaign.md) |
| `/emails/locations/:locationId/campaigns/emails` | `GET` | emails | List Email Campaigns | [ver](./ghl/emails/list-email-campaigns.md) |
| `/emails/locations/:locationId/campaigns/emails` | `POST` | emails | Create Email Campaign | [ver](./ghl/emails/create-email-campaign.md) |
| `/emails/locations/:locationId/campaigns/emails/:campaignId` | `DELETE` | emails | Delete Campaign | [ver](./ghl/emails/delete-campaign.md) |
| `/emails/locations/:locationId/campaigns/emails/:campaignId` | `GET` | emails | Get Email Campaign by ID | [ver](./ghl/emails/get-email-campaign.md) |
| `/emails/locations/:locationId/campaigns/emails/:campaignId` | `PATCH` | emails | Update Email Campaign | [ver](./ghl/emails/update-email-campaign.md) |
| `/emails/locations/:locationId/campaigns/emails/:campaignId/schedule` | `POST` | emails | Schedule Campaign | [ver](./ghl/emails/schedule-campaign.md) |
| `/emails/locations/:locationId/campaigns/stats/:source/:sourceId` | `GET` | emails | Get Campaign Statistics | [ver](./ghl/emails/get-campaign-stats.md) |
| `/emails/locations/:locationId/campaigns/workflows` | `GET` | emails | List Workflow Campaigns | [ver](./ghl/emails/list-workflow-campaigns.md) |
| `/emails/locations/:locationId/campaigns/workflows/:campaignId` | `GET` | emails | Get Workflow Campaign by ID | [ver](./ghl/emails/get-workflow-campaign.md) |
| `/emails/locations/:locationId/templates` | `GET` | emails | List templates | [ver](./ghl/emails/list-email-templates.md) |
| `/emails/locations/:locationId/templates` | `POST` | emails | Create an email template | [ver](./ghl/emails/create-email-template.md) |
| `/emails/locations/:locationId/templates/:templateId` | `DELETE` | emails | Delete a template | [ver](./ghl/emails/delete-email-template.md) |
| `/emails/locations/:locationId/templates/:templateId` | `GET` | emails | Get Email Template by ID | [ver](./ghl/emails/get-email-template.md) |
| `/emails/locations/:locationId/templates/:templateId` | `PATCH` | emails | Update an email template | [ver](./ghl/emails/update-email-template.md) |
| `/emails/locations/:locationId/templates/folders` | `POST` | emails | Create a template folder | [ver](./ghl/emails/create-template-folder.md) |
| `/emails/locations/:locationId/templates/import` | `POST` | emails | Import an email template | [ver](./ghl/emails/import-email-template.md) |
| `/files/d/:slug` | `GET` | files | Get File | [ver](./ghl/files/get-file-by-slug.md) |
| `/forms/` | `GET` | forms | Get Forms | [ver](./ghl/forms/get-forms.md) |
| `/forms/submissions` | `GET` | forms | Get Forms Submissions | [ver](./ghl/forms/get-forms-submissions.md) |
| `/forms/upload-custom-files` | `POST` | forms | Upload files to custom fields | [ver](./ghl/forms/upload-to-custom-fields.md) |
| `/funnels/funnel/list` | `GET` | funnels | Fetch List of Funnels | [ver](./ghl/funnels/get-funnels.md) |
| `/funnels/lookup/redirect` | `POST` | funnels | Create Redirect | [ver](./ghl/funnels/create-redirect.md) |
| `/funnels/lookup/redirect/:id` | `DELETE` | funnels | Delete Redirect By Id | [ver](./ghl/funnels/delete-redirect-by-id.md) |
| `/funnels/lookup/redirect/:id` | `PATCH` | funnels | Update Redirect By Id | [ver](./ghl/funnels/update-redirect-by-id.md) |
| `/funnels/lookup/redirect/list` | `GET` | funnels | Fetch List of Redirects | [ver](./ghl/funnels/fetch-redirects-list.md) |
| `/funnels/page` | `GET` | funnels | Fetch list of funnel pages | [ver](./ghl/funnels/get-pages-by-funnel-id.md) |
| `/funnels/page/count` | `GET` | funnels | Fetch count of funnel pages | [ver](./ghl/funnels/get-pages-count-by-funnel-id.md) |
| `/invoices/` | `GET` | invoices | List invoices | [ver](./ghl/invoices/list-invoices.md) |
| `/invoices/` | `POST` | invoices | Create Invoice | [ver](./ghl/invoices/create-invoice.md) |
| `/invoices/:invoiceId` | `DELETE` | invoices | Delete invoice | [ver](./ghl/invoices/delete-invoice.md) |
| `/invoices/:invoiceId` | `GET` | invoices | Get invoice | [ver](./ghl/invoices/get-invoice.md) |
| `/invoices/:invoiceId` | `PUT` | invoices | Update invoice | [ver](./ghl/invoices/update-invoice.md) |
| `/invoices/:invoiceId/late-fees-configuration` | `PATCH` | invoices | Update invoice late fees configuration | [ver](./ghl/invoices/update-invoice-late-fees-configuration.md) |
| `/invoices/:invoiceId/record-payment` | `POST` | invoices | Record a manual payment for an invoice | [ver](./ghl/invoices/record-invoice.md) |
| `/invoices/:invoiceId/send` | `POST` | invoices | Send invoice | [ver](./ghl/invoices/send-invoice.md) |
| `/invoices/:invoiceId/void` | `POST` | invoices | Void invoice | [ver](./ghl/invoices/void-invoice.md) |
| `/invoices/estimate` | `POST` | invoices | Create New Estimate | [ver](./ghl/invoices/create-new-estimate.md) |
| `/invoices/estimate/:estimateId` | `DELETE` | invoices | Delete Estimate | [ver](./ghl/invoices/delete-estimate.md) |
| `/invoices/estimate/:estimateId` | `PUT` | invoices | Update Estimate | [ver](./ghl/invoices/update-estimate.md) |
| `/invoices/estimate/:estimateId/invoice` | `POST` | invoices | Create Invoice from Estimate | [ver](./ghl/invoices/create-invoice-from-estimate.md) |
| `/invoices/estimate/:estimateId/send` | `POST` | invoices | Send Estimate | [ver](./ghl/invoices/send-estimate.md) |
| `/invoices/estimate/list` | `GET` | invoices | List Estimates | [ver](./ghl/invoices/list-estimates.md) |
| `/invoices/estimate/number/generate` | `GET` | invoices | Generate Estimate Number | [ver](./ghl/invoices/generate-estimate-number.md) |
| `/invoices/estimate/stats/last-visited-at` | `PATCH` | invoices | Update estimate last visited at | [ver](./ghl/invoices/update-estimate-last-visited-at.md) |
| `/invoices/estimate/template` | `GET` | invoices | List Estimate Templates | [ver](./ghl/invoices/list-estimate-templates.md) |
| `/invoices/estimate/template` | `POST` | invoices | Create Estimate Template | [ver](./ghl/invoices/create-estimate-template.md) |
| `/invoices/estimate/template/:templateId` | `DELETE` | invoices | Delete Estimate Template | [ver](./ghl/invoices/delete-estimate-template.md) |
| `/invoices/estimate/template/:templateId` | `PUT` | invoices | Update Estimate Template | [ver](./ghl/invoices/update-estimate-template.md) |
| `/invoices/estimate/template/preview` | `GET` | invoices | Preview Estimate Template | [ver](./ghl/invoices/preview-estimate-template.md) |
| `/invoices/generate-invoice-number` | `GET` | invoices | Generate Invoice Number | [ver](./ghl/invoices/generate-invoice-number.md) |
| `/invoices/schedule` | `GET` | invoices | List schedules | [ver](./ghl/invoices/list-invoice-schedules.md) |
| `/invoices/schedule` | `POST` | invoices | Create Invoice Schedule | [ver](./ghl/invoices/create-invoice-schedule.md) |
| `/invoices/schedule/:scheduleId` | `DELETE` | invoices | Delete schedule | [ver](./ghl/invoices/delete-invoice-schedule.md) |
| `/invoices/schedule/:scheduleId` | `GET` | invoices | Get an schedule | [ver](./ghl/invoices/get-invoice-schedule.md) |
| `/invoices/schedule/:scheduleId` | `PUT` | invoices | Update schedule | [ver](./ghl/invoices/update-invoice-schedule.md) |
| `/invoices/schedule/:scheduleId/auto-payment` | `POST` | invoices | Manage Auto payment for an schedule invoice | [ver](./ghl/invoices/auto-payment-invoice-schedule.md) |
| `/invoices/schedule/:scheduleId/cancel` | `POST` | invoices | Cancel an scheduled invoice | [ver](./ghl/invoices/cancel-invoice-schedule.md) |
| `/invoices/schedule/:scheduleId/schedule` | `POST` | invoices | Schedule an schedule invoice | [ver](./ghl/invoices/schedule-invoice-schedule.md) |
| `/invoices/schedule/:scheduleId/updateAndSchedule` | `POST` | invoices | Update scheduled recurring invoice | [ver](./ghl/invoices/update-and-schedule-invoice-schedule.md) |
| `/invoices/settings` | `GET` | invoices | Get Invoice Settings | [ver](./ghl/invoices/get-invoice-settings.md) |
| `/invoices/stats/last-visited-at` | `PATCH` | invoices | Update invoice last visited at | [ver](./ghl/invoices/update-invoice-last-visited-at.md) |
| `/invoices/template` | `GET` | invoices | List templates | [ver](./ghl/invoices/list-invoice-templates.md) |
| `/invoices/template` | `POST` | invoices | Create template | [ver](./ghl/invoices/create-invoice-template.md) |
| `/invoices/template/:templateId` | `DELETE` | invoices | Delete template | [ver](./ghl/invoices/delete-invoice-template.md) |
| `/invoices/template/:templateId` | `GET` | invoices | Get an template | [ver](./ghl/invoices/get-invoice-template.md) |
| `/invoices/template/:templateId` | `PUT` | invoices | Update template | [ver](./ghl/invoices/update-invoice-template.md) |
| `/invoices/template/:templateId/late-fees-configuration` | `PATCH` | invoices | Update template late fees configuration | [ver](./ghl/invoices/update-invoice-template-late-fees-configuration.md) |
| `/invoices/template/:templateId/payment-methods-configuration` | `PATCH` | invoices | Update template late fees configuration | [ver](./ghl/invoices/update-invoice-payment-methods-configuration.md) |
| `/invoices/text2pay` | `POST` | invoices | Create & Send | [ver](./ghl/invoices/text-2-pay-invoice.md) |
| `/knowledge-bases/` | `GET` | knowledge-base | Get all knowledge bases for a location by location Id (paginated) | [ver](./ghl/knowledge-base/list-all-knowledge-bases-paginated.md) |
| `/knowledge-bases/` | `POST` | knowledge-base | Create a new knowledge base (max 15 knowledge bases per location) | [ver](./ghl/knowledge-base/create-knowledge-base.md) |
| `/knowledge-bases/:id` | `PUT` | knowledge-base | Update a knowledge base | [ver](./ghl/knowledge-base/update-knowledge-base.md) |
| `/knowledge-bases/:knowledgeBaseId` | `DELETE` | knowledge-base | Delete a knowledge base | [ver](./ghl/knowledge-base/delete-knowledge-base.md) |
| `/knowledge-bases/:knowledgeBaseId` | `GET` | knowledge-base | Get knowledge base by ID | [ver](./ghl/knowledge-base/get-knowledge-base-by-id.md) |
| `/knowledge-bases/crawler` | `DELETE` | knowledge-base | Delete trained pages | [ver](./ghl/knowledge-base/delete-trained-urls-for-knowledge-base.md) |
| `/knowledge-bases/crawler` | `GET` | knowledge-base | Get all trained page links by knowledge base | [ver](./ghl/knowledge-base/get-all-website-urls-data-by-knowledge-base.md) |
| `/knowledge-bases/crawler` | `POST` | knowledge-base | Start crawling and discover pages for training | [ver](./ghl/knowledge-base/discover-website.md) |
| `/knowledge-bases/crawler/sitemap-preview` | `POST` | knowledge-base | Preview Sitemap URLs | [ver](./ghl/knowledge-base/get-sitemap-preview.md) |
| `/knowledge-bases/crawler/status` | `GET` | knowledge-base | Get crawling status for the latest operation | [ver](./ghl/knowledge-base/get-crawling-status-for-latest-operation.md) |
| `/knowledge-bases/crawler/train` | `POST` | knowledge-base | Train discovered website pages and ingest into the knowledge base | [ver](./ghl/knowledge-base/train-discovered-urls.md) |
| `/knowledge-bases/faqs` | `GET` | knowledge-base | Get all FAQs by knowledge base with pagination support | [ver](./ghl/knowledge-base/list.md) |
| `/knowledge-bases/faqs` | `POST` | knowledge-base | Create a new FAQ inside knowledge base | [ver](./ghl/knowledge-base/create.md) |
| `/knowledge-bases/faqs/:id` | `DELETE` | knowledge-base | Delete an existing knowledge base FAQ | [ver](./ghl/knowledge-base/delete.md) |
| `/knowledge-bases/faqs/:id` | `PUT` | knowledge-base | Update an existing knowledge base FAQ | [ver](./ghl/knowledge-base/update.md) |
| `/knowledge-bases/files` | `GET` | knowledge-base | Get all files by knowledge base | [ver](./ghl/knowledge-base/get-files-by-knowledge-base-public.md) |
| `/knowledge-bases/files` | `POST` | knowledge-base | Uploads a file to knowledge base (max file size: 10MB) | [ver](./ghl/knowledge-base/upload-file.md) |
| `/knowledge-bases/files/:fileId` | `DELETE` | knowledge-base | Delete a file from knowledge base | [ver](./ghl/knowledge-base/delete-file.md) |
| `/knowledge-bases/files/:fileId` | `GET` | knowledge-base | Get file by id | [ver](./ghl/knowledge-base/get-file-by-id.md) |
| `/links/` | `GET` | links | Get Links | [ver](./ghl/links/get-links.md) |
| `/links/` | `POST` | links | Create Link | [ver](./ghl/links/create-link.md) |
| `/links/:linkId` | `DELETE` | links | Delete Link | [ver](./ghl/links/delete-link.md) |
| `/links/:linkId` | `PUT` | links | Update Link | [ver](./ghl/links/update-link.md) |
| `/links/id/:linkId` | `GET` | links | Get Link by ID | [ver](./ghl/links/get-link-by-id.md) |
| `/links/search` | `GET` | links | Search Trigger Links | [ver](./ghl/links/search-trigger-links.md) |
| `/locations/` | `POST` | locations | Create Sub-Account (Formerly Location) | [ver](./ghl/locations/create-location.md) |
| `/locations/:locationId` | `DELETE` | locations | Delete Sub-Account (Formerly Location) | [ver](./ghl/locations/delete-location.md) |
| `/locations/:locationId` | `GET` | locations | Get Sub-Account (Formerly Location) | [ver](./ghl/locations/get-location.md) |
| `/locations/:locationId` | `PUT` | locations | Put Sub-Account (Formerly Location) | [ver](./ghl/locations/put-location.md) |
| `/locations/:locationId/conversationChannels/:type` | `GET` | locations | Get Conversation Channel | [ver](./ghl/locations/get-conversation-channel.md) |
| `/locations/:locationId/customFields` | `GET` | locations | Get Custom Fields | [ver](./ghl/locations/get-custom-fields.md) |
| `/locations/:locationId/customFields` | `POST` | locations | Create Custom Field | [ver](./ghl/locations/create-custom-field.md) |
| `/locations/:locationId/customFields/:id` | `DELETE` | locations | Delete Custom Field | [ver](./ghl/locations/delete-custom-field.md) |
| `/locations/:locationId/customFields/:id` | `GET` | locations | Get Custom Field | [ver](./ghl/locations/get-custom-field.md) |
| `/locations/:locationId/customFields/:id` | `PUT` | locations | Update Custom Field | [ver](./ghl/locations/update-custom-field.md) |
| `/locations/:locationId/customFields/upload` | `POST` | locations | Uploads File to customFields | [ver](./ghl/locations/upload-file-custom-fields.md) |
| `/locations/:locationId/customValues` | `GET` | locations | Get Custom Values | [ver](./ghl/locations/get-custom-values.md) |
| `/locations/:locationId/customValues` | `POST` | locations | Create Custom Value | [ver](./ghl/locations/create-custom-value.md) |
| `/locations/:locationId/customValues/:id` | `DELETE` | locations | Delete Custom Value | [ver](./ghl/locations/delete-custom-value.md) |
| `/locations/:locationId/customValues/:id` | `GET` | locations | Get Custom Value | [ver](./ghl/locations/get-custom-value.md) |
| `/locations/:locationId/customValues/:id` | `PUT` | locations | Update Custom Value | [ver](./ghl/locations/update-custom-value.md) |
| `/locations/:locationId/permissions` | `GET` | locations | Get Permissions | [ver](./ghl/locations/get-location-permissions.md) |
| `/locations/:locationId/permissions` | `PUT` | locations | Update Permissions | [ver](./ghl/locations/update-location-permissions.md) |
| `/locations/:locationId/recurring-tasks` | `POST` | locations | Create Recurring Task | [ver](./ghl/locations/create-recurring-task.md) |
| `/locations/:locationId/recurring-tasks/:id` | `DELETE` | locations | Delete Recurring Task | [ver](./ghl/locations/delete-recurring-task.md) |
| `/locations/:locationId/recurring-tasks/:id` | `GET` | locations | Get Recurring Task By Id | [ver](./ghl/locations/get-recurring-task-by-id.md) |
| `/locations/:locationId/recurring-tasks/:id` | `PUT` | locations | Update Recurring Task | [ver](./ghl/locations/update-recurring-task.md) |
| `/locations/:locationId/tags` | `GET` | locations | Get Tags | [ver](./ghl/locations/get-location-tags.md) |
| `/locations/:locationId/tags` | `POST` | locations | Create Tag | [ver](./ghl/locations/create-tag.md) |
| `/locations/:locationId/tags/:tagId` | `DELETE` | locations | Delete tag | [ver](./ghl/locations/delete-tag.md) |
| `/locations/:locationId/tags/:tagId` | `GET` | locations | Get tag by id | [ver](./ghl/locations/get-tag-by-id.md) |
| `/locations/:locationId/tags/:tagId` | `PUT` | locations | Update tag | [ver](./ghl/locations/update-tag.md) |
| `/locations/:locationId/tasks/search` | `POST` | locations | Task Search Filter | [ver](./ghl/locations/task-search.md) |
| `/locations/:locationId/templates` | `GET` | locations | GET all or email/sms templates | [ver](./ghl/locations/get-all-or-email-sms-templates.md) |
| `/locations/:locationId/templates/:id` | `DELETE` | locations | DELETE an email/sms template | [ver](./ghl/locations/delete-an-email-sms-template.md) |
| `/locations/:locationId/timezones` | `GET` | locations | Fetch Timezones | [ver](./ghl/locations/get-timezones.md) |
| `/locations/search` | `GET` | locations | Search | [ver](./ghl/locations/search-locations.md) |
| `/marketplace/app/:appId/installations` | `DELETE` | marketplace | Uninstall an application | [ver](./ghl/marketplace/uninstall-application.md) |
| `/marketplace/app/:appId/installations` | `GET` | marketplace | Get Installer Details | [ver](./ghl/marketplace/get-installer-details.md) |
| `/marketplace/app/:appId/rebilling-config/location/:locationId` | `GET` | marketplace | Get rebilling config for an app subscription and usage plans | [ver](./ghl/marketplace/get-rebilling-config-for-app.md) |
| `/marketplace/billing/charges` | `GET` | marketplace | Get all wallet charges | [ver](./ghl/marketplace/get-charges.md) |
| `/marketplace/billing/charges` | `POST` | marketplace | Create a new wallet charge | [ver](./ghl/marketplace/charge.md) |
| `/marketplace/billing/charges/:chargeId` | `DELETE` | marketplace | Delete a wallet charge | [ver](./ghl/marketplace/delete-charge.md) |
| `/marketplace/billing/charges/:chargeId` | `GET` | marketplace | Get specific wallet charge details | [ver](./ghl/marketplace/get-specific-charge.md) |
| `/marketplace/billing/charges/has-funds` | `GET` | marketplace | Check if account has sufficient funds | [ver](./ghl/marketplace/has-funds.md) |
| `/marketplace/external-auth/migration` | `POST` | marketplace | Migrate external authentication connection | [ver](./ghl/marketplace/migrate-connection.md) |
| `/medias/:id` | `DELETE` | medias | Delete File or Folder | [ver](./ghl/medias/delete-media-content.md) |
| `/medias/:id` | `POST` | medias | Update File/Folder | [ver](./ghl/medias/update-media-object.md) |
| `/medias/delete-files` | `PUT` | medias | Bulk Delete / Trash Files/Folders | [ver](./ghl/medias/bulk-delete-media-objects.md) |
| `/medias/files` | `GET` | medias | Get List of Files/Folders | [ver](./ghl/medias/fetch-media-content.md) |
| `/medias/folder` | `POST` | medias | Create Folder | [ver](./ghl/medias/create-media-folder.md) |
| `/medias/update-files` | `PUT` | medias | Bulk Update Files/Folders | [ver](./ghl/medias/bulk-update-media-objects.md) |
| `/medias/upload-file` | `POST` | medias | Upload File into Media Storage | [ver](./ghl/medias/upload-media-content.md) |
| `/oauth/installed-locations` | `GET` | oauth | Get Location where app is installed | [ver](./ghl/oauth/get-installed-location.md) |
| `/oauth/location-token` | `POST` | oauth | Get Location Access Token from Agency Token | [ver](./ghl/oauth/get-location-access-token.md) |
| `/oauth/token` | `POST` | oauth | Get Access Token | [ver](./ghl/oauth/get-access-token.md) |
| `/objects/` | `GET` | objects | Get all objects for a location | [ver](./ghl/objects/get-object-by-location-id.md) |
| `/objects/` | `POST` | objects | Create Custom Object | [ver](./ghl/objects/create-custom-object-schema.md) |
| `/objects/:key` | `GET` | objects | Get Object Schema by key / id | [ver](./ghl/objects/get-object-schema-by-key.md) |
| `/objects/:key` | `PUT` | objects | Update Object Schema By Key / Id | [ver](./ghl/objects/update-custom-object.md) |
| `/objects/:schemaKey/records` | `POST` | objects | Create Record | [ver](./ghl/objects/create-object-record.md) |
| `/objects/:schemaKey/records/:id` | `DELETE` | objects | Delete Record | [ver](./ghl/objects/delete-object-record.md) |
| `/objects/:schemaKey/records/:id` | `GET` | objects | Get Record By Id | [ver](./ghl/objects/get-record-by-id.md) |
| `/objects/:schemaKey/records/:id` | `PUT` | objects | Update Record | [ver](./ghl/objects/update-object-record.md) |
| `/objects/:schemaKey/records/search` | `POST` | objects | Search Object Records | [ver](./ghl/objects/search-object-records.md) |
| `/opportunities/` | `POST` | opportunities | Create Opportunity | [ver](./ghl/opportunities/create-opportunity.md) |
| `/opportunities/:id` | `DELETE` | opportunities | Delete Opportunity | [ver](./ghl/opportunities/delete-opportunity.md) |
| `/opportunities/:id` | `GET` | opportunities | Get Opportunity | [ver](./ghl/opportunities/get-opportunity.md) |
| `/opportunities/:id` | `PUT` | opportunities | Update Opportunity | [ver](./ghl/opportunities/update-opportunity.md) |
| `/opportunities/:id/followers` | `DELETE` | opportunities | Remove Followers | [ver](./ghl/opportunities/remove-followers-opportunity.md) |
| `/opportunities/:id/followers` | `POST` | opportunities | Add Followers | [ver](./ghl/opportunities/add-followers-opportunity.md) |
| `/opportunities/:id/status` | `PUT` | opportunities | Update Opportunity Status | [ver](./ghl/opportunities/update-opportunity-status.md) |
| `/opportunities/lost-reason` | `GET` | opportunities | Get lost reason | [ver](./ghl/opportunities/get-lost-reason.md) |
| `/opportunities/pipelines` | `GET` | opportunities | Get Pipelines | [ver](./ghl/opportunities/get-pipelines.md) |
| `/opportunities/pipelines` | `POST` | opportunities | Create Pipeline | [ver](./ghl/opportunities/create-pipeline.md) |
| `/opportunities/pipelines/:pipelineId` | `DELETE` | opportunities | Delete Pipeline | [ver](./ghl/opportunities/delete-pipeline.md) |
| `/opportunities/pipelines/:pipelineId` | `GET` | opportunities | Get Pipeline | [ver](./ghl/opportunities/get-pipeline.md) |
| `/opportunities/pipelines/:pipelineId` | `PUT` | opportunities | Update Pipeline | [ver](./ghl/opportunities/update-pipeline.md) |
| `/opportunities/search` | `GET` | opportunities | Search Opportunity | [ver](./ghl/opportunities/search-opportunity.md) |
| `/opportunities/search` | `POST` | opportunities | Search Opportunities | [ver](./ghl/opportunities/search-opportunities-advanced.md) |
| `/opportunities/upsert` | `POST` | opportunities | Upsert Opportunity | [ver](./ghl/opportunities/upsert-opportunity.md) |
| `/payments/coupon` | `DELETE` | payments | Delete Coupon | [ver](./ghl/payments/delete-coupon.md) |
| `/payments/coupon` | `GET` | payments | Fetch Coupon | [ver](./ghl/payments/get-coupon.md) |
| `/payments/coupon` | `POST` | payments | Create Coupon | [ver](./ghl/payments/create-coupon.md) |
| `/payments/coupon` | `PUT` | payments | Update Coupon | [ver](./ghl/payments/update-coupon.md) |
| `/payments/coupon/list` | `GET` | payments | List Coupons | [ver](./ghl/payments/list-coupons.md) |
| `/payments/custom-provider/capabilities` | `PUT` | payments | Custom-provider marketplace app update capabilities | [ver](./ghl/payments/custom-provider-marketplace-app-update-capabilities.md) |
| `/payments/custom-provider/connect` | `GET` | payments | Fetch given provider config | [ver](./ghl/payments/fetch-config.md) |
| `/payments/custom-provider/connect` | `POST` | payments | Create new provider config | [ver](./ghl/payments/create-config.md) |
| `/payments/custom-provider/disconnect` | `POST` | payments | Disconnect existing provider config | [ver](./ghl/payments/disconnect-config.md) |
| `/payments/custom-provider/provider` | `DELETE` | payments | Deleting an existing integration | [ver](./ghl/payments/delete-integration.md) |
| `/payments/custom-provider/provider` | `POST` | payments | Create new integration | [ver](./ghl/payments/create-integration.md) |
| `/payments/integrations/provider/whitelabel` | `GET` | payments | List White-label Integration Providers | [ver](./ghl/payments/list-integration-providers.md) |
| `/payments/integrations/provider/whitelabel` | `POST` | payments | Create White-label Integration Provider | [ver](./ghl/payments/create-integration-provider.md) |
| `/payments/orders` | `GET` | payments | List Orders | [ver](./ghl/payments/list-orders.md) |
| `/payments/orders/:orderId` | `GET` | payments | Get Order by ID | [ver](./ghl/payments/get-order-by-id.md) |
| `/payments/orders/:orderId/fulfillments` | `GET` | payments | List fulfillment | [ver](./ghl/payments/list-order-fulfillment.md) |
| `/payments/orders/:orderId/fulfillments` | `POST` | payments | Create order fulfillment | [ver](./ghl/payments/create-order-fulfillment.md) |
| `/payments/orders/:orderId/notes` | `GET` | payments | List Order Notes | [ver](./ghl/payments/list-order-notes.md) |
| `/payments/orders/:orderId/record-payment` | `POST` | payments | Record Order Payment | [ver](./ghl/payments/record-order-payment.md) |
| `/payments/subscriptions` | `GET` | payments | List Subscriptions | [ver](./ghl/payments/list-subscriptions.md) |
| `/payments/subscriptions/:subscriptionId` | `GET` | payments | Get Subscription by ID | [ver](./ghl/payments/get-subscription-by-id.md) |
| `/payments/transactions` | `GET` | payments | List Transactions | [ver](./ghl/payments/list-transactions.md) |
| `/payments/transactions/:transactionId` | `GET` | payments | Get Transaction by ID | [ver](./ghl/payments/get-transaction-by-id.md) |
| `/phone-system/number-pools` | `GET` | phone-system | List number pools | [ver](./ghl/phone-system/get-number-pool-list.md) |
| `/phone-system/numbers/location/:locationId` | `GET` | phone-system | List active numbers | [ver](./ghl/phone-system/active-numbers.md) |
| `/phone-system/numbers/location/:locationId/available` | `GET` | phone-system | List available phone numbers | [ver](./ghl/phone-system/list-available-numbers-for-a-country.md) |
| `/phone-system/numbers/location/:locationId/purchase` | `POST` | phone-system | Purchase number for location | [ver](./ghl/phone-system/purchase-number-for-location.md) |
| `/products/` | `GET` | products | List Products | [ver](./ghl/products/list-invoices.md) |
| `/products/` | `POST` | products | Create Product | [ver](./ghl/products/create-product.md) |
| `/products/:productId` | `DELETE` | products | Delete Product by ID | [ver](./ghl/products/delete-product-by-id.md) |
| `/products/:productId` | `GET` | products | Get Product by ID | [ver](./ghl/products/get-product-by-id.md) |
| `/products/:productId` | `PUT` | products | Update Product by ID | [ver](./ghl/products/update-product-by-id.md) |
| `/products/:productId/price` | `GET` | products | List Prices for a Product | [ver](./ghl/products/list-prices-for-product.md) |
| `/products/:productId/price` | `POST` | products | Create Price for a Product | [ver](./ghl/products/create-price-for-product.md) |
| `/products/:productId/price/:priceId` | `DELETE` | products | Delete Price by ID for a Product | [ver](./ghl/products/delete-price-by-id-for-product.md) |
| `/products/:productId/price/:priceId` | `GET` | products | Get Price by ID for a Product | [ver](./ghl/products/get-price-by-id-for-product.md) |
| `/products/:productId/price/:priceId` | `PUT` | products | Update Price by ID for a Product | [ver](./ghl/products/update-price-by-id-for-product.md) |
| `/products/bulk-update` | `POST` | products | Bulk Update Products | [ver](./ghl/products/bulk-update.md) |
| `/products/bulk-update/edit` | `POST` | products | Bulk Edit Products and Prices | [ver](./ghl/products/bulk-edit.md) |
| `/products/collections` | `GET` | products | Fetch Product Collections | [ver](./ghl/products/get-product-collection.md) |
| `/products/collections` | `POST` | products | Create Product Collection | [ver](./ghl/products/create-product-collection.md) |
| `/products/collections/:collectionId` | `DELETE` | products | Delete Product Collection | [ver](./ghl/products/delete-product-collection.md) |
| `/products/collections/:collectionId` | `GET` | products | Get Details about individual product collection | [ver](./ghl/products/get-product-collection-id.md) |
| `/products/collections/:collectionId` | `PUT` | products | Update Product Collection | [ver](./ghl/products/update-product-collection.md) |
| `/products/inventory` | `GET` | products | List Inventory | [ver](./ghl/products/get-list-inventory.md) |
| `/products/inventory` | `POST` | products | Update Inventory | [ver](./ghl/products/update-inventory.md) |
| `/products/reviews` | `GET` | products | Fetch Product Reviews | [ver](./ghl/products/get-product-reviews.md) |
| `/products/reviews/:reviewId` | `DELETE` | products | Delete Product Review | [ver](./ghl/products/delete-product-review.md) |
| `/products/reviews/:reviewId` | `PUT` | products | Update Product Reviews | [ver](./ghl/products/update-product-review.md) |
| `/products/reviews/bulk-update` | `POST` | products | Update Product Reviews | [ver](./ghl/products/bulk-update-product-review.md) |
| `/products/reviews/count` | `GET` | products | Fetch Review Count as per status | [ver](./ghl/products/get-reviews-count.md) |
| `/products/store/:storeId` | `POST` | products | Action to include/exclude the product in store | [ver](./ghl/products/update-store-status.md) |
| `/products/store/:storeId/priority` | `POST` | products | Update product display priorities in store | [ver](./ghl/products/update-display-priority.md) |
| `/products/store/:storeId/stats` | `GET` | products | Fetch Product Store Stats | [ver](./ghl/products/get-product-store-stats.md) |
| `/proposals/document` | `GET` | proposals | List documents | [ver](./ghl/proposals/list-documents-contracts.md) |
| `/proposals/document/send` | `POST` | proposals | Send document | [ver](./ghl/proposals/send-documents-contracts.md) |
| `/proposals/templates` | `GET` | proposals | List templates | [ver](./ghl/proposals/list-documents-contracts-templates.md) |
| `/proposals/templates/send` | `POST` | proposals | Send template | [ver](./ghl/proposals/send-documents-contracts-template.md) |
| `/saas/agency-plans/:companyId` | `GET` | saas-api | Get Agency Plans | [ver](./ghl/saas-api/get-agency-plans.md) |
| `/saas/allow-attach-rebilling/:locationId` | `POST` | saas-api | Allow Attach Rebilling | [ver](./ghl/saas-api/allow-attach-rebilling.md) |
| `/saas/bulk-disable-saas/:companyId` | `POST` | saas-api | Disable SaaS for locations | [ver](./ghl/saas-api/bulk-disable-saas.md) |
| `/saas/bulk-enable-saas/:companyId` | `POST` | saas-api | Bulk Enable SaaS | [ver](./ghl/saas-api/bulk-enable-saas.md) |
| `/saas/companies/:companyId/locations/:locationId/wallet-balance` | `GET` | saas-api | Get Location Wallet Balance | [ver](./ghl/saas-api/get-location-wallet-balance.md) |
| `/saas/companies/:companyId/locations/:locationId/wallet-balance/complimentary-credits` | `POST` | saas-api | Update Location Wallet Balance | [ver](./ghl/saas-api/update-location-wallet-balance.md) |
| `/saas/companies/:companyId/wallet-transactions` | `POST` | saas-api | List agency wallet transactions | [ver](./ghl/saas-api/list-agency-wallet-transactions.md) |
| `/saas/enable-saas/:locationId` | `POST` | saas-api | Enable SaaS for Sub-Account (Formerly Location) | [ver](./ghl/saas-api/enable-saas-location.md) |
| `/saas/get-saas-subscription/:locationId` | `GET` | saas-api | Get Location Subscription Details | [ver](./ghl/saas-api/get-location-subscription.md) |
| `/saas/locations` | `GET` | saas-api | Get locations by stripeId with companyId | [ver](./ghl/saas-api/locations.md) |
| `/saas/locations/:locationId/wallet-transactions` | `POST` | saas-api | List location wallet transactions | [ver](./ghl/saas-api/list-location-wallet-transactions.md) |
| `/saas/pause/:locationId` | `POST` | saas-api | Pause location | [ver](./ghl/saas-api/pause-location.md) |
| `/saas/remove-attached-config/:locationId` | `POST` | saas-api | Remove attached config | [ver](./ghl/saas-api/remove-attached-config.md) |
| `/saas/saas-locations/:companyId` | `GET` | saas-api | Get SaaS Locations | [ver](./ghl/saas-api/get-saas-locations.md) |
| `/saas/saas-plan/:planId` | `GET` | saas-api | Get SaaS Plan | [ver](./ghl/saas-api/get-saas-plan.md) |
| `/saas/update-rebilling/:companyId` | `POST` | saas-api | Update Rebilling | [ver](./ghl/saas-api/update-rebilling.md) |
| `/saas/update-saas-subscription/:locationId` | `PUT` | saas-api | Update SaaS subscription | [ver](./ghl/saas-api/generate-payment-link.md) |
| `/snapshots/` | `GET` | snapshots | Get Snapshots | [ver](./ghl/snapshots/get-custom-snapshots.md) |
| `/snapshots/share/link` | `POST` | snapshots | Create Snapshot Share Link | [ver](./ghl/snapshots/create-snapshot-share-link.md) |
| `/snapshots/snapshot-status/:snapshotId` | `GET` | snapshots | Get Snapshot Push between Dates | [ver](./ghl/snapshots/get-snapshot-push.md) |
| `/snapshots/snapshot-status/:snapshotId/location/:locationId` | `GET` | snapshots | Get Last Snapshot Push | [ver](./ghl/snapshots/get-latest-snapshot-push.md) |
| `/social-media-posting/:locationId/accounts` | `GET` | social-planner | Get Accounts | [ver](./ghl/social-planner/get-account.md) |
| `/social-media-posting/:locationId/accounts/:id` | `DELETE` | social-planner | Delete Account | [ver](./ghl/social-planner/delete-account.md) |
| `/social-media-posting/:locationId/categories` | `GET` | social-planner | Get categories by location id | [ver](./ghl/social-planner/get-categories-location-id.md) |
| `/social-media-posting/:locationId/categories/:id` | `GET` | social-planner | Get categories by id | [ver](./ghl/social-planner/get-categories-id.md) |
| `/social-media-posting/:locationId/csv` | `GET` | social-planner | Get Upload Status | [ver](./ghl/social-planner/get-upload-status.md) |
| `/social-media-posting/:locationId/csv` | `POST` | social-planner | Upload CSV | [ver](./ghl/social-planner/upload-csv.md) |
| `/social-media-posting/:locationId/csv/:csvId/post/:postId` | `DELETE` | social-planner | Delete CSV Post | [ver](./ghl/social-planner/delete-csv-post.md) |
| `/social-media-posting/:locationId/csv/:id` | `DELETE` | social-planner | Delete CSV | [ver](./ghl/social-planner/delete-csv.md) |
| `/social-media-posting/:locationId/csv/:id` | `GET` | social-planner | Get CSV Post | [ver](./ghl/social-planner/get-csv-post.md) |
| `/social-media-posting/:locationId/csv/:id` | `PATCH` | social-planner | Start CSV Finalize | [ver](./ghl/social-planner/start-csv-finalize.md) |
| `/social-media-posting/:locationId/posts` | `POST` | social-planner | Create post | [ver](./ghl/social-planner/create-post.md) |
| `/social-media-posting/:locationId/posts/:id` | `DELETE` | social-planner | Delete Post | [ver](./ghl/social-planner/delete-post.md) |
| `/social-media-posting/:locationId/posts/:id` | `GET` | social-planner | Get post | [ver](./ghl/social-planner/get-post.md) |
| `/social-media-posting/:locationId/posts/:id` | `PUT` | social-planner | Edit post | [ver](./ghl/social-planner/edit-post.md) |
| `/social-media-posting/:locationId/posts/bulk-delete` | `POST` | social-planner | Bulk Delete Social Planner Posts | [ver](./ghl/social-planner/bulk-delete-social-planner-posts.md) |
| `/social-media-posting/:locationId/posts/list` | `POST` | social-planner | Get posts | [ver](./ghl/social-planner/get-posts.md) |
| `/social-media-posting/:locationId/set-accounts` | `POST` | social-planner | Set Accounts | [ver](./ghl/social-planner/set-accounts.md) |
| `/social-media-posting/:locationId/tags` | `GET` | social-planner | Get tags by location id | [ver](./ghl/social-planner/get-tags-location-id.md) |
| `/social-media-posting/:locationId/tags/details` | `POST` | social-planner | Get tags by ids | [ver](./ghl/social-planner/get-tags-by-ids.md) |
| `/social-media-posting/:locationId/watermarks` | `GET` | social-planner | List watermark templates | [ver](./ghl/social-planner/list-watermark-templates.md) |
| `/social-media-posting/:locationId/watermarks` | `POST` | social-planner | Create a watermark template | [ver](./ghl/social-planner/create-watermark-template.md) |
| `/social-media-posting/:locationId/watermarks/:templateId` | `DELETE` | social-planner | Delete a watermark template by ID | [ver](./ghl/social-planner/delete-watermark-template.md) |
| `/social-media-posting/:locationId/watermarks/:templateId` | `GET` | social-planner | Get a watermark template by ID | [ver](./ghl/social-planner/get-watermark-template.md) |
| `/social-media-posting/:locationId/watermarks/:templateId` | `PUT` | social-planner | Update a watermark template by ID | [ver](./ghl/social-planner/update-watermark-template.md) |
| `/social-media-posting/:locationId/watermarks/add-image-watermark` | `POST` | social-planner | Apply watermark to an image | [ver](./ghl/social-planner/apply-watermark-to-image.md) |
| `/social-media-posting/category/queues` | `POST` | social-planner | Create a new category queue | [ver](./ghl/social-planner/create-queue.md) |
| `/social-media-posting/category/queues/:postId/active-post` | `DELETE` | social-planner | Delete an active post and schedule the next one | [ver](./ghl/social-planner/delete-current-active-post-and-schedule-next.md) |
| `/social-media-posting/category/queues/:queueId` | `GET` | social-planner | Fetch a category queue by ID | [ver](./ghl/social-planner/fetch-queue-by-id.md) |
| `/social-media-posting/category/queues/:queueId` | `PUT` | social-planner | Update queue settings or status | [ver](./ghl/social-planner/update-queue.md) |
| `/social-media-posting/category/queues/:queueId/create/item` | `POST` | social-planner | Create a new item in the queue | [ver](./ghl/social-planner/create-queue-item.md) |
| `/social-media-posting/category/queues/:queueId/edit/calendar` | `POST` | social-planner | Fetch calendar view for an edit session | [ver](./ghl/social-planner/fetch-edit-session-calendar.md) |
| `/social-media-posting/category/queues/:queueId/edit/discard` | `POST` | social-planner | Discard edit session changes | [ver](./ghl/social-planner/discard-edit-session.md) |
| `/social-media-posting/category/queues/:queueId/edit/save` | `POST` | social-planner | Save edit session changes | [ver](./ghl/social-planner/save-edit-session.md) |
| `/social-media-posting/category/queues/:queueId/edit/start` | `POST` | social-planner | Start or resume an edit session | [ver](./ghl/social-planner/start-edit-session.md) |
| `/social-media-posting/category/queues/:queueId/items` | `POST` | social-planner | Fetch items from a queue | [ver](./ghl/social-planner/fetch-queue-items.md) |
| `/social-media-posting/category/queues/:queueId/items/:itemId` | `DELETE` | social-planner | Delete an item from a queue | [ver](./ghl/social-planner/delete-queue-item.md) |
| `/social-media-posting/category/queues/:queueId/items/:itemId` | `PUT` | social-planner | Update an item in a queue | [ver](./ghl/social-planner/update-queue-item.md) |
| `/social-media-posting/category/queues/:queueId/items/:itemId/clone` | `POST` | social-planner | Clone a queue item | [ver](./ghl/social-planner/clone-queue-item.md) |
| `/social-media-posting/category/queues/:queueId/items/:itemId/reset` | `PUT` | social-planner | Reset an item in a queue | [ver](./ghl/social-planner/reset-queue-item.md) |
| `/social-media-posting/category/queues/:queueId/slots` | `POST` | social-planner | Fetch slot information for queue items | [ver](./ghl/social-planner/fetch-slots.md) |
| `/social-media-posting/category/queues/available-categories` | `GET` | social-planner | Get all categories with their queue status | [ver](./ghl/social-planner/fetch-available-categories.md) |
| `/social-media-posting/category/queues/list` | `POST` | social-planner | Fetch category queues for a location | [ver](./ghl/social-planner/fetch-queues.md) |
| `/social-media-posting/category/queues/list/calendar` | `POST` | social-planner | Get scheduled posts calendar view | [ver](./ghl/social-planner/fetch-calendar-list.md) |
| `/social-media-posting/comments/:platform` | `POST` | social-planner | Create a comment or reply | [ver](./ghl/social-planner/create-comment.md) |
| `/social-media-posting/comments/:platform/:id/like` | `DELETE` | social-planner | Unlike a comment | [ver](./ghl/social-planner/delete-like.md) |
| `/social-media-posting/comments/:platform/:id/like` | `POST` | social-planner | Like a comment | [ver](./ghl/social-planner/create-like.md) |
| `/social-media-posting/comments/:platform/list` | `POST` | social-planner | List comments for a post or thread | [ver](./ghl/social-planner/get-comment-list.md) |
| `/social-media-posting/oauth/:locationId/:platform/accounts/:accountId` | `GET` | social-planner | Get Available Accounts (Step 2 of 3) | [ver](./ghl/social-planner/get-oauth-accounts.md) |
| `/social-media-posting/oauth/:locationId/:platform/accounts/:accountId` | `POST` | social-planner | Connect Account (Step 3 of 3) | [ver](./ghl/social-planner/attach-oauth-accounts.md) |
| `/social-media-posting/oauth/:platform/start` | `GET` | social-planner | Start OAuth Flow (Step 1 of 3) | [ver](./ghl/social-planner/start-oauth.md) |
| `/social-media-posting/statistics` | `POST` | social-planner | Get Social Media Statistics | [ver](./ghl/social-planner/get-statistics.md) |
| `/store/shipping-carrier` | `GET` | store | List Shipping Carriers | [ver](./ghl/store/list-shipping-carriers.md) |
| `/store/shipping-carrier` | `POST` | store | Create Shipping Carrier | [ver](./ghl/store/create-shipping-carrier.md) |
| `/store/shipping-carrier/:shippingCarrierId` | `DELETE` | store | Delete shipping carrier | [ver](./ghl/store/delete-shipping-carrier.md) |
| `/store/shipping-carrier/:shippingCarrierId` | `GET` | store | Get Shipping Carrier | [ver](./ghl/store/get-shipping-carriers.md) |
| `/store/shipping-carrier/:shippingCarrierId` | `PUT` | store | Update Shipping Carrier | [ver](./ghl/store/update-shipping-carrier.md) |
| `/store/shipping-zone` | `GET` | store | List Shipping Zones | [ver](./ghl/store/list-shipping-zones.md) |
| `/store/shipping-zone` | `POST` | store | Create Shipping Zone | [ver](./ghl/store/create-shipping-zone.md) |
| `/store/shipping-zone/:shippingZoneId` | `DELETE` | store | Delete shipping zone | [ver](./ghl/store/delete-shipping-zone.md) |
| `/store/shipping-zone/:shippingZoneId` | `GET` | store | Get Shipping Zone | [ver](./ghl/store/get-shipping-zones.md) |
| `/store/shipping-zone/:shippingZoneId` | `PUT` | store | Update Shipping Zone | [ver](./ghl/store/update-shipping-zone.md) |
| `/store/shipping-zone/:shippingZoneId/shipping-rate` | `GET` | store | List Shipping Rates | [ver](./ghl/store/list-shipping-rates.md) |
| `/store/shipping-zone/:shippingZoneId/shipping-rate` | `POST` | store | Create Shipping Rate | [ver](./ghl/store/create-shipping-rate.md) |
| `/store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId` | `DELETE` | store | Delete shipping rate | [ver](./ghl/store/delete-shipping-rate.md) |
| `/store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId` | `GET` | store | Get Shipping Rate | [ver](./ghl/store/get-shipping-rates.md) |
| `/store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId` | `PUT` | store | Update Shipping Rate | [ver](./ghl/store/update-shipping-rate.md) |
| `/store/shipping-zone/shipping-rates` | `POST` | store | Get available shipping rates | [ver](./ghl/store/get-available-shipping-zones.md) |
| `/store/store-setting` | `GET` | store | Get Store Settings | [ver](./ghl/store/get-store-settings.md) |
| `/store/store-setting` | `POST` | store | Create/Update Store Settings | [ver](./ghl/store/create-store-setting.md) |
| `/surveys/` | `GET` | surveys | Get Surveys | [ver](./ghl/surveys/get-surveys.md) |
| `/surveys/submissions` | `GET` | surveys | Get Surveys Submissions | [ver](./ghl/surveys/get-surveys-submissions.md) |
| `/users/` | `POST` | users | Create User | [ver](./ghl/users/create-user.md) |
| `/users/:userId` | `DELETE` | users | Delete User | [ver](./ghl/users/delete-user.md) |
| `/users/:userId` | `GET` | users | Get User | [ver](./ghl/users/get-user.md) |
| `/users/:userId` | `PUT` | users | Update User | [ver](./ghl/users/update-user.md) |
| `/users/search` | `GET` | users | Search Users | [ver](./ghl/users/search-users.md) |
| `/users/search/filter-by-email` | `POST` | users | Filter Users by Email | [ver](./ghl/users/filter-users-by-email.md) |
| `/voice-ai/actions` | `POST` | voice-ai | Create Agent Action | [ver](./ghl/voice-ai/create-action.md) |
| `/voice-ai/actions/:actionId` | `DELETE` | voice-ai | Delete Agent Action | [ver](./ghl/voice-ai/delete-action.md) |
| `/voice-ai/actions/:actionId` | `GET` | voice-ai | Get Agent Action | [ver](./ghl/voice-ai/get-action.md) |
| `/voice-ai/actions/:actionId` | `PUT` | voice-ai | Update Agent Action | [ver](./ghl/voice-ai/update-action.md) |
| `/voice-ai/agents` | `GET` | voice-ai | List Agents | [ver](./ghl/voice-ai/get-agents.md) |
| `/voice-ai/agents` | `POST` | voice-ai | Create Agent | [ver](./ghl/voice-ai/create-agent.md) |
| `/voice-ai/agents/:agentId` | `DELETE` | voice-ai | Delete Agent | [ver](./ghl/voice-ai/delete-agent.md) |
| `/voice-ai/agents/:agentId` | `GET` | voice-ai | Get Agent | [ver](./ghl/voice-ai/get-agent.md) |
| `/voice-ai/agents/:agentId` | `PATCH` | voice-ai | Patch Agent | [ver](./ghl/voice-ai/patch-agent.md) |
| `/voice-ai/dashboard/call-logs` | `GET` | voice-ai | List Call Logs | [ver](./ghl/voice-ai/get-call-logs.md) |
| `/voice-ai/dashboard/call-logs/:callId` | `GET` | voice-ai | Get Call Log | [ver](./ghl/voice-ai/get-call-log.md) |
| `/workflows/` | `GET` | workflows | Get Workflow | [ver](./ghl/workflows/get-workflow.md) |
