
-- Migration to support tagged images
-- Convert existing image arrays to tagged JSON format

-- Update vendors table
ALTER TABLE vendors 
ALTER COLUMN portfolio_image_urls TYPE JSONB USING 
CASE 
  WHEN portfolio_image_urls IS NULL THEN NULL
  WHEN array_length(portfolio_image_urls, 1) IS NULL THEN NULL
  ELSE jsonb_build_object('general', to_jsonb(portfolio_image_urls))
END;

-- Update vendor_services table  
ALTER TABLE vendor_services
ALTER COLUMN portfolio_image_urls TYPE JSONB USING
CASE 
  WHEN portfolio_image_urls IS NULL THEN NULL
  WHEN array_length(portfolio_image_urls, 1) IS NULL THEN NULL
  ELSE jsonb_build_object('general', to_jsonb(portfolio_image_urls))
END;

-- Update staff_portfolios table
ALTER TABLE staff_portfolios
ALTER COLUMN image_urls TYPE JSONB USING
CASE 
  WHEN image_urls IS NULL THEN NULL
  WHEN array_length(image_urls, 1) IS NULL THEN NULL
  ELSE jsonb_build_object('general', to_jsonb(image_urls))
END;

ALTER TABLE staff_portfolios
ALTER COLUMN video_urls TYPE JSONB USING
CASE 
  WHEN video_urls IS NULL THEN NULL
  WHEN array_length(video_urls, 1) IS NULL THEN NULL
  ELSE jsonb_build_object('general', to_jsonb(video_urls))
END;

-- Add indexes for better performance on tagged queries
CREATE INDEX IF NOT EXISTS idx_vendors_portfolio_tags ON vendors USING gin (portfolio_image_urls);
CREATE INDEX IF NOT EXISTS idx_vendor_services_portfolio_tags ON vendor_services USING gin (portfolio_image_urls);
CREATE INDEX IF NOT EXISTS idx_staff_portfolios_image_tags ON staff_portfolios USING gin (image_urls);
CREATE INDEX IF NOT EXISTS idx_staff_portfolios_video_tags ON staff_portfolios USING gin (video_urls);
