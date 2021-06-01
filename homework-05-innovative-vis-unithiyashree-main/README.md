# Innovative Visualization Design

In this homework, you will create a unique visualization that goes beyond the "common chart types" that you already exist. **This assignment is worth 10 points.**

The audience for this visualization is visitors to a musuem. The goal is to communicate certain aspects of the data effectively and in a creative manner, as opposed to supporting in-depth analysis such as might be done by domain experts.

There are two datasets available for this project (choose one).

* Soviet space dogs ([souce](https://airtable.com/universe/expG3z2CFykG1dZsp/sovet-space-dogs?explore=true)): This dataset contains two tables.
    * Dogs: 48 dogs who participated in the Soviet space program in the 1950s and 1960s.
    * Flights: 42 missions that the dogs flew on.
* Burritos in San Diego ([source](https://www.kaggle.com/srcole/burritos-in-san-diego)): This dataset contains a single table that lists several ratings of ~200 burritos from ~50 restaurants in San Diego.

## Requirements

* Create a page `index.html` in this repostory for storing your visualization.
* Create a unique D3 visualization that is not simply an existing technique or D3 block. 
    * You may import existing code, but you must document exactly what modifications you make in your writeup, and you should _substantially_ change any imported code that you build upon. If you're unsure what constitutes substantial, talk to the TA.
* You must visualize at least three different attributes. 
    * You must use at least one quantatitive and one categorical attribute.
    * If you choose Space Dogs, temporal attributes may be used for quantatitive.
    * If you choose Burritos, you can derive the lat/long coordinates based on the address for the quantitative attribute. For the purposes of this assignment, "latitude and longitude" counts as one attribute, so you need at least more attributes.
* You are not required to visualize _all_ of the given data. You may focus on a specific topic or question that you want to address, and therefore you might only need to look at a subset of the data (attributes or items) to answer it.
* One approach for creating a unique visualization is to create custom glyphs. Here are some examples that can provide inspiration.
    * [lalettura](http://giorgialupi.com/lalettura)
    * [film flowers](http://sxywu.com/filmflowers/)
    * [Visualizing Painter's Lives](http://giorgialupi.com/visualizing-painters-lives)
    * [How's life?](http://www.oecdbetterlifeindex.org/#/31111111111)
    * [Where the Wild Bees Are](https://www.scientificamerican.com/article/where-the-wild-bees-are/)
    * [Giorgia Lupi and Stefanie Posavec’s Life Data Visualizations](https://www.moma.org/magazine/articles/309)
    * [VIS Arts Program 2019](https://visap.net/2019/program.html)
* You may choose to create either a static or interactive visualization.
* Above your chart/infographic, add a title and short description that explains your design (marks, channels, interactions).
* If you modified an existing block, below the visualization provide a link to the original source code and describe (in detail) how you modified it to create your chart.

You are free (and encouraged!) to be creative on this assignment, including the use of abstract, artistic, and illustrative designs. Don't submit just a basic D3 block (bar chart, scatterplot, pie/donut chart, line chart, node-link diagram, tree, etc.), or you'll receive a 0 on this assignment. Especially creative or interesting submissions are eligible for up to 2 points extra credit.
