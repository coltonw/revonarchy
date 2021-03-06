# Revonarchy

**Rev**olving M**onarchy**

Keeps a revolving list for choosing a decision maker in a group. Groups are not
explicitly created but are determined automatically based on the people listed.

[![Build Status](https://travis-ci.org/coltonw/revonarchy.svg?branch=master)](https://travis-ci.org/coltonw/revonarchy) [![Coverage Status](https://coveralls.io/repos/coltonw/revonarchy/badge.svg?branch=master)](https://coveralls.io/r/coltonw/revonarchy?branch=master) [![Dependency Status](https://gemnasium.com/coltonw/revonarchy.svg)](https://gemnasium.com/coltonw/revonarchy)

## How it works

### The Queue

Every person is given a random **queue value** between 0 and 1.  The person with
the lowest number is picked as the **Revonarch**. Then the queue numbers rotate
such that every participant has their **queue value** lowered except the
**Revonarch** who now has the highest value.

### Determining Groups

The list of users is submitted.  All the queue values are grabbed for all the
users.  If there is any group id which among those which either 100% of the
users have queue values for or at least a minimum number have queue values for
(currently 3) *and* at least some percentage have queue values for (currently
35%) then the group which qualifies with the highest percent match is used.  If
no group qualifies, a new group uuid is generated. Either way, any users that
already have a queue value for that group use that queue value and any that
don't create a new random queue value with that user and group id value.

### Do it Again

Users are kept as local storage on the browser where they were created. Also,
there are hard links which can be used to get the same users on other browsers
without requiring re-typing all the information.

## Attributions

[Crown favicon](http://www.aha-soft.com/iconsets.htm)
