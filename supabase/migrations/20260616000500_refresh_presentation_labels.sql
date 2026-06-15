update public.product_presentations
set label = case
  when measurement_kind = 'unit' and amount_value = 1 then 'unidad'
  when measurement_kind = 'unit' then trim(trailing '.' from trim(to_char(amount_value, 'FM999999990.###'))) || ' unidades'
  when measurement_kind = 'weight' then trim(trailing '.' from trim(to_char(amount_value, 'FM999999990.###'))) || amount_unit
  when measurement_kind = 'volume' then trim(trailing '.' from trim(to_char(amount_value, 'FM999999990.###'))) || amount_unit
  else label
end
where measurement_kind is not null
  and amount_value is not null
  and amount_unit is not null;
