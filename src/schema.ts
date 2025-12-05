import { sql } from 'drizzle-orm';
import {
  char,
  decimal,
  index,
  integer,
  json,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const board = pgTable(
  'board',
  {
    boardId: uuid('board_id').primaryKey().default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 500 }),
    config: json('config'),
    userId: uuid('user_id'),
    orgId: uuid('org_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  table => {
    return {
      createdAtIdx: index('board_created_at_idx').on(table.createdAt),
      orgIdIdx: index('board_org_id_idx').on(table.orgId),
      userIdIdx: index('board_user_id_idx').on(table.userId),
    };
  },
);

export const boardWidget = pgTable(
  'board_widget',
  {
    widgetId: uuid('widget_id').primaryKey().default(sql`gen_random_uuid()`),
    boardId: uuid('board_id').notNull(),
    websiteId: uuid('website_id').notNull(),
    type: varchar('type', { length: 50 }).notNull(), // stats, chart, list, map, heatmap
    title: varchar('title', { length: 100 }),
    config: json('config'), // type-specific config (metrics, listType, limit, etc.)
    position: integer('position').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  table => {
    return {
      boardIdIdx: index('board_widget_board_id_idx').on(table.boardId),
      websiteIdIdx: index('board_widget_website_id_idx').on(table.websiteId),
      boardIdPositionIdx: index('board_widget_board_id_position_idx').on(
        table.boardId,
        table.position,
      ),
    };
  },
);

export const eventData = pgTable(
  'event_data',
  {
    eventDataId: uuid('event_data_id').primaryKey().default(sql`gen_random_uuid()`),
    websiteId: uuid('website_id').notNull(),
    websiteEventId: uuid('website_event_id').notNull(),
    dataKey: varchar('data_key', { length: 500 }).notNull(),
    stringValue: varchar('string_value', { length: 500 }),
    numberValue: decimal('number_value', { precision: 19, scale: 4 }),
    dateValue: timestamp('date_value', { withTimezone: true }),
    dataType: integer('data_type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => {
    return {
      createdAtIdx: index('event_data_created_at_idx').on(table.createdAt),
      websiteEventIdIdx: index('event_data_website_event_id_idx').on(table.websiteEventId),
      websiteIdCreatedAtDataKeyIdx: index('event_data_website_id_created_at_data_key_idx').on(
        table.websiteId,
        table.createdAt,
        table.dataKey,
      ),
      websiteIdCreatedAtIdx: index('event_data_website_id_created_at_idx').on(
        table.websiteId,
        table.createdAt,
      ),
      websiteIdIdx: index('event_data_website_id_idx').on(table.websiteId),
    };
  },
);

export const link = pgTable(
  'link',
  {
    linkId: uuid('link_id').primaryKey().default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 100 }).notNull(),
    url: varchar('url', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    userId: uuid('user_id'),
    orgId: uuid('org_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  table => {
    return {
      createdAtIdx: index('link_created_at_idx').on(table.createdAt),
      orgIdIdx: index('link_org_id_idx').on(table.orgId),
      slugIdx: index('link_slug_idx').on(table.slug),
      userIdIdx: index('link_user_id_idx').on(table.userId),
    };
  },
);

export const org = pgTable(
  'org',
  {
    orgId: uuid('org_id').primaryKey().default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 50 }).notNull(),
    accessCode: varchar('access_code', { length: 50 }).unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    logoUrl: varchar('logo_url', { length: 2183 }),
  },
  table => {
    return {
      accessCodeIdx: index('org_access_code_idx').on(table.accessCode),
    };
  },
);

export const orgUser = pgTable(
  'org_user',
  {
    orgUserId: uuid('org_user_id').primaryKey(),
    orgId: uuid('org_id').notNull(),
    userId: uuid('user_id').notNull(),
    role: varchar('role', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  table => {
    return {
      orgIdIdx: index('org_user_org_id_idx').on(table.orgId),
      userIdIdx: index('org_user_user_id_idx').on(table.userId),
    };
  },
);

export const pixel = pgTable(
  'pixel',
  {
    pixelId: uuid('pixel_id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    userId: uuid('user_id'),
    orgId: uuid('org_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  table => {
    return {
      createdAtIdx: index('pixel_created_at_idx').on(table.createdAt),
      orgIdIdx: index('pixel_org_id_idx').on(table.orgId),
      slugIdx: index('pixel_slug_idx').on(table.slug),
      userIdIdx: index('pixel_user_id_idx').on(table.userId),
    };
  },
);

export const report = pgTable(
  'report',
  {
    reportId: uuid('report_id').primaryKey(),
    userId: uuid('user_id').notNull(),
    websiteId: uuid('website_id').notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    description: varchar('description', { length: 500 }).notNull(),
    parameters: json('parameters').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  table => {
    return {
      nameIdx: index('report_name_idx').on(table.name),
      typeIdx: index('report_type_idx').on(table.type),
      userIdIdx: index('report_user_id_idx').on(table.userId),
      websiteIdIdx: index('report_website_id_idx').on(table.websiteId),
    };
  },
);

export const revenue = pgTable(
  'revenue',
  {
    revenueId: uuid('revenue_id').primaryKey(),
    websiteId: uuid('website_id').notNull(),
    sessionId: uuid('session_id').notNull(),
    eventId: uuid('event_id').notNull(),
    eventName: varchar('event_name', { length: 50 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull(),
    revenue: decimal('revenue', { precision: 19, scale: 4 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => {
    return {
      sessionIdIdx: index('revenue_session_id_idx').on(table.sessionId),
      websiteIdCreatedAtIdx: index('revenue_website_id_created_at_idx').on(
        table.websiteId,
        table.createdAt,
      ),
      websiteIdIdx: index('revenue_website_id_idx').on(table.websiteId),
      websiteIdSessionIdCreatedAtIdx: index('revenue_website_id_session_id_created_at_idx').on(
        table.websiteId,
        table.sessionId,
        table.createdAt,
      ),
    };
  },
);

export const segment = pgTable(
  'segment',
  {
    segmentId: uuid('segment_id').primaryKey(),
    websiteId: uuid('website_id').notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    parameters: json('parameters').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  table => {
    return {
      websiteIdIdx: index('segment_website_id_idx').on(table.websiteId),
    };
  },
);

export const session = pgTable(
  'session',
  {
    sessionId: uuid('session_id').primaryKey(),
    websiteId: uuid('website_id').notNull(),
    browser: varchar('browser', { length: 20 }),
    os: varchar('os', { length: 20 }),
    device: varchar('device', { length: 20 }),
    screen: varchar('screen', { length: 11 }),
    language: varchar('language', { length: 35 }),
    country: char('country', { length: 2 }),
    region: varchar('region', { length: 20 }),
    city: varchar('city', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    distinctId: varchar('distinct_id', { length: 50 }),
  },
  table => {
    return {
      createdAtIdx: index('session_created_at_idx').on(table.createdAt),
      websiteIdCreatedAtBrowserIdx: index('session_website_id_created_at_browser_idx').on(
        table.websiteId,
        table.createdAt,
        table.browser,
      ),
      websiteIdCreatedAtCityIdx: index('session_website_id_created_at_city_idx').on(
        table.websiteId,
        table.createdAt,
        table.city,
      ),
      websiteIdCreatedAtCountryIdx: index('session_website_id_created_at_country_idx').on(
        table.websiteId,
        table.createdAt,
        table.country,
      ),
      websiteIdCreatedAtDeviceIdx: index('session_website_id_created_at_device_idx').on(
        table.websiteId,
        table.createdAt,
        table.device,
      ),
      websiteIdCreatedAtIdx: index('session_website_id_created_at_idx').on(
        table.websiteId,
        table.createdAt,
      ),
      websiteIdCreatedAtLanguageIdx: index('session_website_id_created_at_language_idx').on(
        table.websiteId,
        table.createdAt,
        table.language,
      ),
      websiteIdCreatedAtOsIdx: index('session_website_id_created_at_os_idx').on(
        table.websiteId,
        table.createdAt,
        table.os,
      ),
      websiteIdCreatedAtRegionIdx: index('session_website_id_created_at_region_idx').on(
        table.websiteId,
        table.createdAt,
        table.region,
      ),
      websiteIdCreatedAtScreenIdx: index('session_website_id_created_at_screen_idx').on(
        table.websiteId,
        table.createdAt,
        table.screen,
      ),
      websiteIdIdx: index('session_website_id_idx').on(table.websiteId),
    };
  },
);

export const sessionData = pgTable(
  'session_data',
  {
    sessionDataId: uuid('session_data_id').primaryKey(),
    websiteId: uuid('website_id').notNull(),
    sessionId: uuid('session_id').notNull(),
    dataKey: varchar('data_key', { length: 500 }).notNull(),
    stringValue: varchar('string_value', { length: 500 }),
    numberValue: decimal('number_value', { precision: 19, scale: 4 }),
    dateValue: timestamp('date_value', { withTimezone: true }),
    dataType: integer('data_type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    distinctId: varchar('distinct_id', { length: 50 }),
  },
  table => {
    return {
      createdAtIdx: index('session_data_created_at_idx').on(table.createdAt),
      sessionIdCreatedAtIdx: index('session_data_session_id_created_at_idx').on(
        table.sessionId,
        table.createdAt,
      ),
      sessionIdIdx: index('session_data_session_id_idx').on(table.sessionId),
      websiteIdCreatedAtDataKeyIdx: index('session_data_website_id_created_at_data_key_idx').on(
        table.websiteId,
        table.createdAt,
        table.dataKey,
      ),
      websiteIdIdx: index('session_data_website_id_idx').on(table.websiteId),
    };
  },
);

export const user = pgTable(
  'user',
  {
    userId: uuid('user_id').primaryKey(),
    role: varchar('role', { length: 50 }).default('user').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    displayName: varchar('display_name', { length: 255 }),
    clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 255 }),
    lastName: varchar('last_name', { length: 255 }),
    imageUrl: varchar('image_url', { length: 2183 }),
  },
  table => {
    return {
      emailIdx: index('user_email_idx').on(table.email),
    };
  },
);

export const website = pgTable(
  'website',
  {
    websiteId: uuid('website_id').primaryKey().default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 100 }).notNull(),
    domain: varchar('domain', { length: 500 }),
    shareId: varchar('share_id', { length: 50 }).unique(),
    resetAt: timestamp('reset_at', { withTimezone: true }),
    userId: uuid('user_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdBy: uuid('created_by'),
    orgId: uuid('org_id'),
  },
  table => {
    return {
      createdAtIdx: index('website_created_at_idx').on(table.createdAt),
      createdByIdx: index('website_created_by_idx').on(table.createdBy),
      orgIdIdx: index('website_org_id_idx').on(table.orgId),
      shareIdIdx: index('website_share_id_idx').on(table.shareId),
      userIdIdx: index('website_user_id_idx').on(table.userId),
    };
  },
);

export const websiteEvent = pgTable(
  'website_event',
  {
    eventId: uuid('event_id').primaryKey(),
    websiteId: uuid('website_id').notNull(),
    sessionId: uuid('session_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    urlPath: varchar('url_path', { length: 500 }).notNull(),
    urlQuery: varchar('url_query', { length: 500 }),
    referrerPath: varchar('referrer_path', { length: 500 }),
    referrerQuery: varchar('referrer_query', { length: 500 }),
    referrerDomain: varchar('referrer_domain', { length: 500 }),
    pageTitle: varchar('page_title', { length: 500 }),
    eventType: integer('event_type').default(1).notNull(),
    eventName: varchar('event_name', { length: 50 }),
    visitId: uuid('visit_id').notNull(),
    tag: varchar('tag', { length: 50 }),
    fbclid: varchar('fbclid', { length: 255 }),
    gclid: varchar('gclid', { length: 255 }),
    liFatId: varchar('li_fat_id', { length: 255 }),
    msclkid: varchar('msclkid', { length: 255 }),
    ttclid: varchar('ttclid', { length: 255 }),
    twclid: varchar('twclid', { length: 255 }),
    utmCampaign: varchar('utm_campaign', { length: 255 }),
    utmContent: varchar('utm_content', { length: 255 }),
    utmMedium: varchar('utm_medium', { length: 255 }),
    utmSource: varchar('utm_source', { length: 255 }),
    utmTerm: varchar('utm_term', { length: 255 }),
    hostname: varchar('hostname', { length: 100 }),
  },
  table => {
    return {
      createdAtIdx: index('website_event_created_at_idx').on(table.createdAt),
      sessionIdIdx: index('website_event_session_id_idx').on(table.sessionId),
      visitIdIdx: index('website_event_visit_id_idx').on(table.visitId),
      websiteIdCreatedAtEventNameIdx: index(
        'website_event_website_id_created_at_event_name_idx',
      ).on(table.websiteId, table.createdAt, table.eventName),
      websiteIdCreatedAtHostnameIdx: index('website_event_website_id_created_at_hostname_idx').on(
        table.websiteId,
        table.createdAt,
        table.hostname,
      ),
      websiteIdCreatedAtIdx: index('website_event_website_id_created_at_idx').on(
        table.websiteId,
        table.createdAt,
      ),
      websiteIdCreatedAtPageTitleIdx: index(
        'website_event_website_id_created_at_page_title_idx',
      ).on(table.websiteId, table.createdAt, table.pageTitle),
      websiteIdCreatedAtReferrerDomainIdx: index(
        'website_event_website_id_created_at_referrer_domain_idx',
      ).on(table.websiteId, table.createdAt, table.referrerDomain),
      websiteIdCreatedAtTagIdx: index('website_event_website_id_created_at_tag_idx').on(
        table.websiteId,
        table.createdAt,
        table.tag,
      ),
      websiteIdCreatedAtUrlPathIdx: index('website_event_website_id_created_at_url_path_idx').on(
        table.websiteId,
        table.createdAt,
        table.urlPath,
      ),
      websiteIdCreatedAtUrlQueryIdx: index('website_event_website_id_created_at_url_query_idx').on(
        table.websiteId,
        table.createdAt,
        table.urlQuery,
      ),
      websiteIdIdx: index('website_event_website_id_idx').on(table.websiteId),
      websiteIdSessionIdCreatedAtIdx: index(
        'website_event_website_id_session_id_created_at_idx',
      ).on(table.websiteId, table.sessionId, table.createdAt),
      websiteIdVisitIdCreatedAtIdx: index('website_event_website_id_visit_id_created_at_idx').on(
        table.websiteId,
        table.visitId,
        table.createdAt,
      ),
    };
  },
);

// Type exports for TypeScript inference
export type Board = typeof board.$inferSelect;
export type NewBoard = typeof board.$inferInsert;

export type BoardWidget = typeof boardWidget.$inferSelect;
export type NewBoardWidget = typeof boardWidget.$inferInsert;

export type EventData = typeof eventData.$inferSelect;
export type NewEventData = typeof eventData.$inferInsert;

export type Link = typeof link.$inferSelect;
export type NewLink = typeof link.$inferInsert;

export type Org = typeof org.$inferSelect;
export type NewOrg = typeof org.$inferInsert;

export type OrgUser = typeof orgUser.$inferSelect;
export type NewOrgUser = typeof orgUser.$inferInsert;

export type Pixel = typeof pixel.$inferSelect;
export type NewPixel = typeof pixel.$inferInsert;

export type Report = typeof report.$inferSelect;
export type NewReport = typeof report.$inferInsert;

export type Revenue = typeof revenue.$inferSelect;
export type NewRevenue = typeof revenue.$inferInsert;

export type Segment = typeof segment.$inferSelect;
export type NewSegment = typeof segment.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type SessionData = typeof sessionData.$inferSelect;
export type NewSessionData = typeof sessionData.$inferInsert;

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Website = typeof website.$inferSelect;
export type NewWebsite = typeof website.$inferInsert;

export type WebsiteEvent = typeof websiteEvent.$inferSelect;
export type NewWebsiteEvent = typeof websiteEvent.$inferInsert;
