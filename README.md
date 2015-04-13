# Revonarchy

**Rev**olving M**onarchy**

Keeps a revolving list for choosing a decision maker in a group. Groups are not
explicitly created but are determined automatically based on the people listed.

[![Build Status](https://travis-ci.org/coltonw/revonarchy.svg?branch=master)](https://travis-ci.org/coltonw/revonarchy) [![Coverage Status](https://img.shields.io/coveralls/coltonw/revonarchy.svg)](https://coveralls.io/r/coltonw/revonarchy) [![Dependency Status](https://gemnasium.com/coltonw/revonarchy.svg)](https://gemnasium.com/coltonw/revonarchy)

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
(going to choose 3 at first) *and* at least some percentage have queue values for
(going to choose 35% at first) then the group which qualifies with the highest
percent match is used.  If no group qualifies, a new group uuid is generated.
Either way, any users that already have a queue value for that group use that
queue value and any that don't create a new random queue value with that user
and group id value.

## Data Format

Users - `id` `emailAddress` `name`?

Email addresses must be unique.

Queue Values - `userId` `groupId` `queueValue`

Each user id and group id combo must be unique.