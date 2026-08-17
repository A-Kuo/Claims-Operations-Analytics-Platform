{% macro parse_mixed_date(column_name) %}
    cast(
        coalesce(
            try_strptime(trim(cast({{ column_name }} as varchar)), '%Y-%m-%d'),
            try_strptime(trim(cast({{ column_name }} as varchar)), '%m/%d/%Y'),
            try_strptime(trim(cast({{ column_name }} as varchar)), '%Y/%m/%d'),
            try_cast(trim(cast({{ column_name }} as varchar)) as timestamp)
        ) as date
    )
{% endmacro %}
