var assert = require('assert')
  , should = require('should')
  , _ = require('underscore')
  , async = require('async')

describe('chat', function() {
  describe('#unit', function() {
    it('should spill out objects from array', function() {
      obj = { 
        "users_analytics" : [ {
            "total" : 1015,
            "total_active_users" : 5
          } ]
      }
      console.log(obj['users_analytics'][0])
      _.isArray(obj['users_analytics']).should.be.ok
    })
  })
  it('should run callback functions in parallel', function(done) {
    var func1 = function(fn) {
      return fn(null, "Hello")
    }
    var func2 = function(fn) {
      return fn(null, "John")
    }
    function func3(fn) {
      async.parallel([func1, func2
        ],
        function(err, result) {
          return fn(err, result)
        }
      )
    }

    func3(function(err, res) {
      console.log("func3 result", res)
      res.should.be.ok
      done()
    })
  })
  it('should run callback functions in series', function(done) {

    var cookcalls = 0
      //, ingredients = ['one', 'two']
      , ingredients = {"v4.2.0": [{one: {"method": "POST"}, two: {"method": "PUT"}}]}
      , funcs = {}
      , tasks = {}
    var cook = function(params) {
      //cookcalls++
      //console.log("cookcalls called ", cookcalls + " times ")
      //fn(null, cookcalls + " time(s)." + params + " function")
      console.log("params are: ", params)
      return "params are: " + params
    }
    _.each(ingredients["v4.2.0"], function(value, item) {
      funcs[item] = function(fn) {
        cookcalls++   
        console.log("cookcalls called ", cookcalls + " times ")
        cook(value)
        fn(null, cookcalls + " times(s). params are: " + value)
      }
    })
    _.extend(tasks, funcs)
    //console.log(_.extend(tasks, funcs))
    function func3(fn) {
      async.series(tasks, 
        function(err, result) {
          return fn(err, result)
        }
      )
    }
    func3(function(err, res) {
      console.log("cookie result", res)
      res.should.be.ok
      done()
    })
  })
  it('should get the first key of an object', function() {
    obj = {'top_10_users': [{'username': 'johndoexyz'}, {'username': 'janedoexyz'}]}
    keys = _.keys(obj)
    console.log(keys)
    keys.should.be.ok
    assert.equal(keys[0], 'top_10_users')
  })
  it('should contain some array items', function(done) {
    var actual = ['name', 'title']
    var expected = ['username', 'verified']
    function isFound(item, fn) {
      console.log('item is', item)
      if(_.contains(expected, item)) {
        fn(true)
      } else {
        fn(false)
      }
    }
    async.some(actual, isFound, function(result) {
      if(result) {
        console.log(result)
        result.should.be.ok
      } else {
        assert.equal(result, true)
        done()
      }
    })
  })
  it('should match obj key in arr', function() {
    var arr = [ { bob: 'marley' }, { annie: 'macauley' } ]
    _.each(arr, function(val, key) {
      console.log(val)
      val keys = Object.keys(val)
      if(Object.keys(val) == ['bob']) {
        item = arr[key]
        console.log(item)
        assert.equal('marley', item)
      }
    })
  })
})
