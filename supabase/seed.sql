-- Seed Data for Geotechnical Operations Platform
-- Projects, Boreholes, Assignments, Site Logs, and OCR attachments

-- Clear test data if exists
DELETE FROM public.log_attachments;
DELETE FROM public.site_logs;
DELETE FROM public.boreholes;
DELETE FROM public.project_assignments;
DELETE FROM public.projects;
DELETE FROM public.users;

-- 1. Insert Demo Users (Admins, Managers, Field Engineers)
-- Note: In production Supabase, auth.users contains these IDs.
INSERT INTO public.users (id, email, full_name, role, phone_number)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin@geotechops.com', 'Dr. Rajesh Sharma (Chief Geologist)', 'admin', '+91 98480 11223'),
    ('b0000000-0000-0000-0000-000000000002', 'manager.meera@geotechops.com', 'Meera Krishnan (Senior Geotechnical Lead)', 'manager', '+91 94401 22334'),
    ('c0000000-0000-0000-0000-000000000003', 'engineer.rahul@geotechops.com', 'Rahul Verma (Site Geologist)', 'field_engineer', '+91 97001 33445'),
    ('c0000000-0000-0000-0000-000000000004', 'engineer.priya@geotechops.com', 'Priya Patel (Field Engineer)', 'field_engineer', '+91 99882 44556')
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- 2. Insert Realistic Projects
INSERT INTO public.projects (id, project_code, project_name, client_name, location_address, city, state, status, created_by)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'METRO-EXT-A',
        'Metro Line Extension - Site A (Corridor 3)',
        'Hyderabad Metro Rail Corporation (HMRCL)',
        'Survey No. 42, Hitec City Phase 2',
        'Hyderabad',
        'Telangana',
        'active',
        'a0000000-0000-0000-0000-000000000001'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'TOWER-GACH-45',
        'Commercial Tower - Gachibowli (45 Floors)',
        'Phoenix Infocity Real Estate Pvt Ltd',
        'Plot 18/A, Financial District, Nanakramguda',
        'Hyderabad',
        'Telangana',
        'active',
        'b0000000-0000-0000-0000-000000000002'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'NH-BYPASS-EX',
        'Expressway Elevated Viaduct Pier Soil Investigation',
        'National Highways Authority of India (NHAI)',
        'Chainage KM 42+200, Outer Ring Road Junction',
        'Hyderabad',
        'Telangana',
        'completed',
        'a0000000-0000-0000-0000-000000000001'
    );

-- 3. Project Assignments for Field Engineers
INSERT INTO public.project_assignments (id, project_id, user_id, assigned_by)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002');

-- 4. Boreholes
INSERT INTO public.boreholes (id, project_id, borehole_no, depth_target_m, depth_drilled_m, status, ground_elevation_m, latitude, longitude, rig_type, drilling_method)
VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'BH-01',
        30.0,
        18.5,
        'in_progress',
        542.30,
        17.4435,
        78.3772,
        'Hydraulic Rotary Calweld Rig - HR40',
        'Rotary Mud Circulation Drilling'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000001',
        'BH-02',
        25.0,
        25.0,
        'completed',
        541.80,
        17.4442,
        78.3780,
        'Eicher Tractor Mounted Rotary Rig',
        'Wash Boring with Diamond Core Bit'
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000002',
        'BH-03',
        45.0,
        22.0,
        'in_progress',
        560.10,
        17.4190,
        78.3485,
        'Casagrande B125 XP Foundation Rig',
        'Rotary Core Drilling with Double Tube Barrel'
    ),
    (
        '30000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000002',
        'TP-01',
        5.0,
        4.5,
        'completed',
        559.40,
        17.4185,
        78.3491,
        'JCB 3DX Excavator Pit',
        'Trial Pit Open Cut'
    );

-- 5. Site Logs
INSERT INTO public.site_logs (
    id, borehole_id, engineer_id, depth_from_m, depth_to_m, sample_no, strata_classification, 
    color_description, density_consistency, spt_blows_15cm, spt_blows_30cm, spt_blows_45cm, spt_n_value, 
    core_recovery_pct, rqd_pct, water_table_depth_m, water_table_encountered, notes, 
    gps_lat, gps_long, gps_accuracy_m, verification_status, reviewed_by, reviewed_at, review_comments
)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000003',
        0.00,
        1.50,
        'SS-01',
        'Topsoil / Fill material with brickbats & gravel',
        'Dark Brownish Grey',
        'Loose',
        3, 4, 5, 9,
        NULL, NULL,
        NULL, false,
        'Surface soil mixed with gravel fill. Moderate organic traces.',
        17.443512, 78.377201, 3.2,
        'Approved',
        'b0000000-0000-0000-0000-000000000002',
        timezone('utc'::text, now() - INTERVAL '2 days'),
        'Stratum verified against adjacent utility trench profile. Concur with N=9 loose fill rating.'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000003',
        1.50,
        4.50,
        'SS-02',
        'Medium Stiff Silty Clay (CI-CH)',
        'Reddish Brown mottled with Yellow',
        'Medium Stiff',
        5, 8, 9, 17,
        NULL, NULL,
        3.80, true,
        'Water seepage observed at 3.80m. Moderate plasticity, slickensided fissures noticed.',
        17.443518, 78.377210, 2.8,
        'Approved',
        'a0000000-0000-0000-0000-000000000001',
        timezone('utc'::text, now() - INTERVAL '1 day'),
        'Plasticity index verified in lab index tests (LL=48, PL=22). Approved.'
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000003',
        4.50,
        9.00,
        'SPT-03',
        'Dense Silty Coarse Sand with Quartz gravel (SM)',
        'Light Grey to Fawn',
        'Dense',
        11, 16, 21, 37,
        NULL, NULL,
        3.80, true,
        'High resistance SPT test. Sub-angular quartz grains up to 8mm size. No core barrel needed yet.',
        17.443525, 78.377218, 3.1,
        'Pending Review',
        NULL, NULL, NULL
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000003',
        9.00,
        15.00,
        'CR-01',
        'Completely Weathered Granite (Grades V-IV) / Murrum',
        'Pinkish Grey',
        'Very Dense / Soft Rock',
        25, 42, 50, 92,
        65.0, 32.0,
        3.80, true,
        'Refusal met at 11.2m (N>100 blows/30cm). Switched to double-tube core barrel NX size. Core recovery 65%.',
        17.443530, 78.377222, 2.9,
        'Pending Review',
        NULL, NULL, NULL
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        '30000000-0000-0000-0000-000000000003',
        'c0000000-0000-0000-0000-000000000004',
        15.00,
        18.50,
        'CR-02',
        'Moderately Weathered to Fresh Granite (Grade III-II)',
        'Grey with Quartz and Feldspar phenocrysts',
        'Hard Rock',
        NULL, NULL, NULL, NULL,
        88.0, 74.0,
        4.20, true,
        'Excellent core quality. Joint set dipping at approx 45 degrees, filled with calcite thin films.',
        17.419015, 78.348520, 2.4,
        'Flagged for Re-test',
        'b0000000-0000-0000-0000-000000000002',
        timezone('utc'::text, now() - INTERVAL '4 hours'),
        'Core photo in field sheet shows fractured zone at 16.2m that does not tally with 74% RQD reported. Please re-calculate pieces > 100mm and re-upload specimen photo.'
    );

-- 6. Log Attachments with sample OCR metadata
INSERT INTO public.log_attachments (
    id, log_id, attachment_type, file_url, mime_type, file_size_bytes, 
    extracted_text_json, generated_xlsx_url, ocr_status, ocr_processed_at
)
VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000003',
        'site_photo',
        'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
        'image/jpeg',
        2450120,
        '{"description": "Rig Calweld HR40 operational at BH-01 station, casing installed down to 6.0m", "rig_status": "drilling", "casing_depth_m": 6.0}',
        NULL,
        'completed',
        timezone('utc'::text, now() - INTERVAL '1 day')
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        '40000000-0000-0000-0000-000000000003',
        'sample_card',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        'image/jpeg',
        1854300,
        '{
            "project_code": "METRO-EXT-A",
            "borehole_no": "BH-01",
            "sample_id": "SPT-03",
            "depth_range": "4.50m - 9.00m",
            "date": "2026-11-02",
            "sampler_type": "Standard Split Spoon",
            "engineer": "Rahul Verma"
        }',
        NULL,
        'completed',
        timezone('utc'::text, now() - INTERVAL '1 day')
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        '40000000-0000-0000-0000-000000000003',
        'field_sheet',
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
        'image/jpeg',
        3120400,
        '{
            "document_header": {
                "project_name": "Metro Line Extension - Site A",
                "client": "HMRCL",
                "borehole_no": "BH-01",
                "date": "02/11/2026",
                "ground_water_level_m": 3.8
            },
            "parsed_rows": [
                {
                    "run_no": 3,
                    "depth_from_m": 4.5,
                    "depth_to_m": 9.0,
                    "sample_no": "SPT-03",
                    "soil_description": "Dense Silty Coarse Sand with Quartz gravel (SM)",
                    "spt_blows": {"15cm": 11, "30cm": 16, "45cm": 21, "n_value": 37},
                    "core_recovery_pct": null,
                    "rqd_pct": null,
                    "water_table_m": 3.8
                }
            ],
            "confidence_score": 0.96
        }',
        '/storage/v1/object/public/generated-xlsx/METRO-EXT-A_BH-01_Run03.xlsx',
        'completed',
        timezone('utc'::text, now() - INTERVAL '1 day')
    );

