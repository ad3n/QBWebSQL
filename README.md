QBWebSQL
========

QBWebSQL (Query Builder for WebSQL) is a tool to make simple web sql query likes create table, insert, update, delete, and select

<h3>How to use</h3>:

```javascript
WebSQL.db.open();
WebSQL.db.queryBuilder.selects(['ID', 'name'], function() {
    WebSQL.db.queryBuilder.from('test', function() {
        WebSQL.db.queryBuilder.join('x', 'test.xID = x.ID', 'INNER', function() {
            WebSQL.db.queryBuilder.join('y', 'test.xID = y.ID', 'OUTER', function() {
                WebSQL.db.queryBuilder.where([{ id : 'ID', operator : '=', value : 1, conjunction : 'AND' }, { id : 'name', operator : '=', value : 'surya', conjunction : 'AND'}], function () {
                    WebSQL.db.queryBuilder.query(function(sqlStatement, parameters) {
                        WebSQL.db.execute(sqlStatement, parameters, function(results) {
                            //do something
                        });
                    });
                });
            });
        });
    });
});
```

<h3>Avialable functions</h3>:
```javascript
WebSQL.insert(table, columns, values, callback);
WebSQL.update(table, columns, values, where, callback);
WebSQL.destroy(table, where, callback);
```
