# chart-maker

A chart (flowchart or dependency graph) editor

# Demos

## Flowchart

[Flowchart Demo](https://d3lo92uftxhq1a.cloudfront.net/flowchart/)

[Example](https://d3lo92uftxhq1a.cloudfront.net/flowchart/?diagram=U29tZSBTdGF0ZW1lbnQKQW5vdGhlciBTdGF0ZW1lbnQKaWYgKFNvbWUgQ29uZGl0aW9uPykgewogICAgaWYgKE5lc3RlZCBDb25kaXRpb24%2FKSB7CiAgICAgICAgRG8gdGhpcwogICAgICAgIFRoZW4gdGhpcwogICAgfSBlbHNlIHsKICAgICAgICBEbyB0aGlzIGluc3RlYWQKICAgIH0KfSBlbHNlIGlmIChBbm90aGVyIENvbmRpdGlvbj8pIHsKICAgIEFub3RoZXIgdGhpbmcgdG8gZG8KfQp3aGlsZSAoTW9yZSBUaGluZ3MgVG8gRG8%2FKSB7CiAgICBpZiAoVGlyZWQ%2FKSB7CiAgICAgICAgRWF0IFNvbWV0aGluZwogICAgfQogICAgRG8gVGhpbmdzCn0KT25lIExhc3QgVGhpbmc%3D):
```
Some Statement
Another Statement
if (Some Condition?) {
    if (Nested Condition?) {
        Do this
        Then this
    } else {
        Do this instead
    }
} else if (Another Condition?) {
    Another thing to do
}
while (More Things To Do?) {
    if (Tired?) {
        Eat Something
    }
    Do Things
}
One Last Thing
```

## Dependency Graph
[Dependency Graph Demo](https://d3lo92uftxhq1a.cloudfront.net/tree_diagram/)

[Example](https://d3lo92uftxhq1a.cloudfront.net/tree_diagram/?diagram=Um9vdAogICAgTGV2ZWwgMSBDaGlsZCBBCiAgICAgICAgTGV2ZWwgMiBDaGlsZCBBLUEKICAgICAgICBMZXZlbCAyIENoaWxkIEEtQgogICAgICAgICAgICBTaGFyZWQgTm9kZQogICAgTGV2ZWwgMSBDaGlsZCBCCiAgICAgICAgTGV2ZWwgMiBDaGlsZCBCLUEKICAgICAgICBMZXZlbCAyIENoaWxkIEItQgogICAgU2hhcmVkIE5vZGU%3D):
```
Root
    Level 1 Child A
        Level 2 Child A-A
        Level 2 Child A-B
            Shared Node
    Level 1 Child B
        Level 2 Child B-A
        Level 2 Child B-B
    Shared Node
````
