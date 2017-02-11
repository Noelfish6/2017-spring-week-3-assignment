# Week 3 Assignment

## Exercise 1: A Short Crossfilter Exercise
A recap of some key crossfilter tasks: creating dimensions, grouping by dimension, and group reduce; see lines 21-40 for assignment prompts


## Exercise 2: Putting Crossfilter to Work
### Part 1
Go to line 92. This block of code demonstrates a basic implementation of `d3.brush`. A brush is a UI element that allows the user to select and highlight a region, giving the user the ability to create a filtering range.

You are not expected to learn to master brushes yet. Take a look at the example and try to understand its basic implementation. Between lines 110 and 113, write a block of code to update the other charts, based on the results of the filtering operation.

### Part 2
The function `drawUserType` should draw (and update/redraw) a pie chart showing the breakdown of registered vs. casual users. However, as it's currently implemented, it doesn't support updates. This is because the "update/exit" part of the "enter/update/exit" pattern is not implemented. Refractor the code between lines 146-165 to account for this.

### Part 3 (Optional)
For extra practice, complete the `drawUserGender` function.
