SELECT 
    u.name AS user_name,
    a.name AS asset_name
FROM asset_assignments aa
JOIN users u ON aa.user_id = u.id
JOIN assets a ON aa.asset_id = a.id;
